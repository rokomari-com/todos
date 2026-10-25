port module Main exposing (..)

{-| TodoMVC in Elm with todo types (Personal / Work).

To add a type: add a constructor to `EntryType`, then extend `nextType`,
`typeKey`, `typeLabel`, `typeShape` and `requireListed` (compiler-enforced,
exhaustive cases) and add it to `allTypes`. `nextType` must cycle back to
Personal. Add `.mark-<key>` (color) and, for a new shape, `.shape-*` in
css/app.css.
-}

import Browser
import Browser.Dom as Dom
import Browser.Events
import Browser.Navigation as Nav
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Html.Keyed as Keyed
import Html.Lazy exposing (lazy2, lazy3, lazy4)
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode
import Process
import Task
import Time
import Url exposing (Url)


main : Program Decode.Value Model Msg
main =
    Browser.application
        { init = init
        , view = view
        , update = updateWithStorage
        , subscriptions = subscriptions
        , onUrlRequest = UrlRequested
        , onUrlChange = UrlChanged
        }


port setStorage : Encode.Value -> Cmd msg


{-| Document-level pointer events (move / up / cancel), forwarded by ports.js. Only subscribed while dragging. -}
port dragEvents : ({ kind : String, x : Float, y : Float, pageY : Float } -> msg) -> Sub msg


updateWithStorage : Msg -> Model -> ( Model, Cmd Msg )
updateWithStorage msg model =
    let
        ( newModel, cmds ) =
            update msg model
    in
    ( newModel
    , if isTransient msg then
        cmds

      else
        Cmd.batch [ setStorage (encodeModel newModel), cmds ]
    )


{-| High-frequency drag bookkeeping never changes persisted state; skip the storage write. -}
isTransient : Msg -> Bool
isTransient msg =
    case msg of
        NoOp ->
            True

        DragStart _ _ _ _ _ ->
            True

        DragCancel ->
            True

        DragMoved _ _ _ ->
            True

        DragFrame ->
            True

        GotViewport _ ->
            True

        GotRects _ _ _ ->
            True

        _ ->
            False



-- TYPES


type EntryType
    = Personal
    | Work


allTypes : List EntryType
allTypes =
    List.map requireListed [ Personal, Work ]


{-| Compiler guard: adding a constructor breaks this case. Add new type to
`allTypes` above when you extend it.
-}
requireListed : EntryType -> EntryType
requireListed t =
    case t of
        Personal ->
            t

        Work ->
            t


typeKey : EntryType -> String
typeKey t =
    case t of
        Personal ->
            "personal"

        Work ->
            "work"


type Shape
    = Circle
    | Square


{-| Second visual channel besides color, for color-blind users.
-}
typeShape : EntryType -> Shape
typeShape t =
    case t of
        Personal ->
            Circle

        Work ->
            Square


typeLabel : EntryType -> String
typeLabel t =
    case t of
        Personal ->
            "Personal"

        Work ->
            "Work"


typeFromKey : String -> Maybe EntryType
typeFromKey key =
    List.filter (\t -> typeKey t == key) allTypes |> List.head


{-| Next type in the cycle; the last one wraps to Personal.
-}
nextType : EntryType -> EntryType
nextType t =
    case t of
        Personal ->
            Work

        Work ->
            Personal



-- MODEL


type Visibility
    = All
    | Active
    | Completed
    | ArchiveView


type TypeFilter
    = AnyType
    | OnlyType EntryType


type alias Model =
    { entries : List Entry
    , field : String
    , uid : Int
    , newType : EntryType
    , visibility : Visibility
    , typeFilter : TypeFilter
    , editBackup : Maybe ( Int, String )
    , typeMenuOpen : Bool
    , pressing : Maybe Press
    , pressSeq : Int
    , confirmingDelete : Maybe Int
    , drag : Maybe Drag
    , announce : String
    , key : Nav.Key
    , zone : Time.Zone
    }


{-| A touch press on a row that may still become a long-press. -}
type alias Press =
    { id : Int
    , seq : Int
    , x : Float
    , y : Float
    }


{-| A row drag. `rects` are the visible rows' document-space boxes cached at drag start; `slot` is the
final index among the visible rows if dropped now. A drag is `active` once the pointer moved > 6px (touch handle: at once).
-}
type alias Drag =
    { id : Int
    , seq : Int
    , startX : Float
    , startY : Float
    , startPageY : Float
    , clientY : Float
    , pageY : Float
    , active : Bool
    , rects : List Rect
    , slot : Int
    }


type alias Rect =
    { id : Int
    , top : Float
    , height : Float
    }


type alias Entry =
    { description : String
    , completed : Bool
    , editing : Bool
    , id : Int
    , entryType : EntryType
    , completedAt : Maybe Time.Posix
    , archivedAt : Maybe Time.Posix
    , order : Int
    }


newEntry : String -> Int -> EntryType -> Int -> Entry
newEntry desc id t order =
    { description = desc
    , completed = False
    , editing = False
    , id = id
    , entryType = t
    , completedAt = Nothing
    , archivedAt = Nothing
    , order = order
    }


visibilityFromUrl : Url -> Visibility
visibilityFromUrl url =
    case url.fragment of
        Just "/active" ->
            Active

        Just "/completed" ->
            Completed

        Just "/archive" ->
            ArchiveView

        _ ->
            All


init : Decode.Value -> Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url key =
    let
        saved =
            Decode.decodeValue savedDecoder flags
                |> Result.withDefault emptySaved
    in
    ( { entries = withOrders saved.entries
      , field = saved.field
      , uid = Basics.max saved.uid (1 + maxId saved.entries)
      , newType = saved.newType
      , visibility = visibilityFromUrl url
      , typeFilter = saved.typeFilter
      , editBackup = Nothing
      , typeMenuOpen = False
      , pressing = Nothing
      , pressSeq = 0
      , confirmingDelete = Nothing
      , drag = Nothing
      , announce = ""
      , key = key
      , zone = Time.utc
      }
    , Task.perform identity (Task.map2 GotTime Time.here Time.now)
    )



{-| Entries saved before ordering existed (or with a bad order) take their stored position. -}
withOrders : List Entry -> List Entry
withOrders entries =
    if List.any (\e -> e.order < 0) entries then
        List.indexedMap (\i e -> { e | order = i }) entries

    else
        entries


maxOrder : List Entry -> Int
maxOrder entries =
    List.map .order entries |> List.maximum |> Maybe.withDefault -1


maxId : List Entry -> Int
maxId entries =
    List.map .id entries |> List.maximum |> Maybe.withDefault -1



-- PERSISTENCE


type alias Saved =
    { entries : List Entry
    , field : String
    , uid : Int
    , newType : EntryType
    , typeFilter : TypeFilter
    }


emptySaved : Saved
emptySaved =
    { entries = [], field = "", uid = 0, newType = Personal, typeFilter = AnyType }


typeDecoder : Decoder EntryType
typeDecoder =
    Decode.string
        |> Decode.andThen
            (\s ->
                case typeFromKey s of
                    Just t ->
                        Decode.succeed t

                    Nothing ->
                        Decode.fail ("unknown type " ++ s)
            )


{-| Missing or unknown type decodes as Personal (old saved data).
-}
typeOrPersonal : String -> Decoder EntryType
typeOrPersonal name =
    Decode.oneOf [ Decode.field name typeDecoder, Decode.succeed Personal ]


entryDecoder : Decoder Entry
entryDecoder =
    Decode.succeed Entry
        |> andMap (Decode.field "description" Decode.string)
        |> andMap (Decode.field "completed" Decode.bool)
        |> andMap (Decode.succeed False)
        |> andMap (Decode.field "id" Decode.int)
        |> andMap (typeOrPersonal "type")
        |> andMap (optionalTime "completedAt")
        |> andMap (optionalTime "archivedAt")
        |> andMap (Decode.oneOf [ Decode.field "order" Decode.int, Decode.succeed -1 ])


andMap : Decoder a -> Decoder (a -> b) -> Decoder b
andMap =
    Decode.map2 (|>)


{-| Epoch ms; missing or malformed decodes as Nothing (old saved data).
-}
optionalTime : String -> Decoder (Maybe Time.Posix)
optionalTime name =
    Decode.oneOf
        [ Decode.field name (Decode.map (Just << Time.millisToPosix) Decode.int)
        , Decode.succeed Nothing
        ]


lenientEntries : Decoder (List Entry)
lenientEntries =
    Decode.list (Decode.oneOf [ Decode.map Just entryDecoder, Decode.succeed Nothing ])
        |> Decode.map (List.filterMap identity)


typeFilterDecoder : Decoder TypeFilter
typeFilterDecoder =
    Decode.oneOf
        [ Decode.field "typeFilter" Decode.string
            |> Decode.andThen
                (\k ->
                    case typeFromKey k of
                        Just t ->
                            Decode.succeed (OnlyType t)

                        Nothing ->
                            Decode.succeed AnyType
                )
        , Decode.succeed AnyType
        ]


savedDecoder : Decoder Saved
savedDecoder =
    Decode.map5 Saved
        (Decode.oneOf [ Decode.field "entries" lenientEntries, Decode.succeed [] ])
        (Decode.oneOf [ Decode.field "field" Decode.string, Decode.succeed "" ])
        (Decode.oneOf [ Decode.field "uid" Decode.int, Decode.succeed 0 ])
        (typeOrPersonal "newType")
        typeFilterDecoder


encodeEntry : Entry -> Encode.Value
encodeEntry e =
    Encode.object
        [ ( "description", Encode.string e.description )
        , ( "completed", Encode.bool e.completed )
        , ( "id", Encode.int e.id )
        , ( "type", Encode.string (typeKey e.entryType) )
        , ( "completedAt", encodeTime e.completedAt )
        , ( "archivedAt", encodeTime e.archivedAt )
        , ( "order", Encode.int e.order )
        ]


encodeTime : Maybe Time.Posix -> Encode.Value
encodeTime t =
    case t of
        Just p ->
            Encode.int (Time.posixToMillis p)

        Nothing ->
            Encode.null


encodeModel : Model -> Encode.Value
encodeModel m =
    Encode.object
        [ ( "entries", Encode.list encodeEntry m.entries )
        , ( "field", Encode.string m.field )
        , ( "uid", Encode.int m.uid )
        , ( "newType", Encode.string (typeKey m.newType) )
        , ( "typeFilter"
          , Encode.string
                (case m.typeFilter of
                    AnyType ->
                        "all"

                    OnlyType t ->
                        typeKey t
                )
          )
        ]



-- UPDATE


type Msg
    = NoOp
    | UpdateField String
    | EditingEntry Int Bool
    | CancelEdit Int
    | DragStart Int Float Float Float Bool
    | GotRects Int (List Int) (Result Dom.Error (List Dom.Element))
    | DragMoved Float Float Float
    | DragEnded
    | DragCancel
    | DragFrame
    | GotViewport Dom.Viewport
    | MoveBy Int Int
    | PressStart Int Float Float
    | PressMove Float Float
    | PressEnd Int
    | PressCancel
    | LongPress Int Int
    | DismissConfirm
    | UpdateEntry Int String
    | Add
    | Delete Int
    | ArchiveCompleted
    | ArchiveCompletedAt Time.Posix
    | ArchiveItem Int
    | ArchiveItemAt Int Time.Posix
    | Restore Int
    | Touched Int Time.Posix
    | Check Int Bool
    | CheckAt Int Bool Time.Posix
    | CheckAll Bool
    | CheckAllAt Bool Time.Posix
    | GotTime Time.Zone Time.Posix
    | Tick Time.Posix
    | SetNewType EntryType
    | CycleNewType
    | CycleEntryType Int
    | SetTypeFilter TypeFilter
    | ToggleTypeMenu
    | OpenTypeMenu
    | CloseTypeMenu
    | CloseTypeMenuRefocus
    | FocusMenuItem Int
    | ShowAll
    | UrlRequested Browser.UrlRequest
    | UrlChanged Url


isLive : Entry -> Bool
isLive e =
    e.archivedAt == Nothing


isArchived : Entry -> Bool
isArchived e =
    e.archivedAt /= Nothing


withNow : (Time.Posix -> Msg) -> Cmd Msg
withNow toMsg =
    Task.perform toMsg Time.now


thirtyDaysMs : Int
thirtyDaysMs =
    30 * 24 * 60 * 60 * 1000


{-| Stamp completedAt on completed entries that lack one (data from before archiving), so nothing
auto-archives right after an upgrade.
-}
migrate : Time.Posix -> List Entry -> List Entry
migrate now =
    let
        nowMs =
            Time.posixToMillis now

        valid t =
            if Time.posixToMillis t < 0 || Time.posixToMillis t > nowMs then
                Nothing

            else
                Just t
    in
    List.map
        (\e ->
            let
                archivedAt =
                    e.archivedAt |> Maybe.andThen valid

                completedAt =
                    e.completedAt |> Maybe.andThen valid
            in
            if e.completed && completedAt == Nothing then
                { e | archivedAt = archivedAt, completedAt = Just (Maybe.withDefault now archivedAt) }

            else
                { e | archivedAt = archivedAt, completedAt = completedAt }
        )


{-| Archive completed entries untouched for more than 30 days.
-}
sweep : Time.Posix -> List Entry -> List Entry
sweep now =
    List.map
        (\e ->
            case ( e.completed, e.archivedAt, e.completedAt ) of
                ( True, Nothing, Just c ) ->
                    if Time.posixToMillis now - Time.posixToMillis c > thirtyDaysMs then
                        { e | archivedAt = Just now }

                    else
                        e

                _ ->
                    e
        )


inScope : TypeFilter -> Entry -> Bool
inScope filter e =
    case filter of
        AnyType ->
            True

        OnlyType t ->
            e.entryType == t


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch [ Time.every (60 * 60 * 1000) Tick, confirmSubs model, dragSubs model ]


dragSubs : Model -> Sub Msg
dragSubs model =
    case model.drag of
        Nothing ->
            Sub.none

        Just d ->
            Sub.batch
                [ dragEvents
                    (\e ->
                        case e.kind of
                            "move" ->
                                DragMoved e.x e.y e.pageY

                            "up" ->
                                DragEnded

                            _ ->
                                DragCancel
                    )
                , Browser.Events.onKeyDown
                    (Decode.field "key" Decode.string
                        |> Decode.andThen
                            (\k ->
                                if k == "Escape" then
                                    Decode.succeed DragCancel

                                else
                                    Decode.fail "not escape"
                            )
                    )
                , if d.active then
                    Browser.Events.onAnimationFrame (\_ -> DragFrame)

                  else
                    Sub.none
                ]


confirmSubs : Model -> Sub Msg
confirmSubs model =
    case model.confirmingDelete of
        Nothing ->
            Sub.none

        Just _ ->
            Sub.batch
                [ Browser.Events.onKeyDown
                    (Decode.field "key" Decode.string
                        |> Decode.andThen
                            (\k ->
                                if k == "Escape" then
                                    Decode.succeed DismissConfirm

                                else
                                    Decode.fail "not escape"
                            )
                    )
                , Browser.Events.onClick
                    (insideConfirm
                        |> Decode.andThen
                            (\inside ->
                                if inside then
                                    Decode.fail "inside"

                                else
                                    Decode.succeed DismissConfirm
                            )
                    )
                ]


{-| True when the event target sits inside a delete-confirm overlay. -}
insideConfirm : Decoder Bool
insideConfirm =
    Decode.field "target" (climbToConfirm ())


climbToConfirm : () -> Decoder Bool
climbToConfirm _ =
    Decode.field "className" (Decode.oneOf [ Decode.string, Decode.succeed "" ])
        |> Decode.andThen
            (\cls ->
                if List.member "confirm-delete" (String.words cls) then
                    Decode.succeed True

                else
                    Decode.oneOf
                        [ Decode.field "parentElement" (Decode.lazy climbToConfirm)
                        , Decode.succeed False
                        ]
            )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )

        Add ->
            ( { model
                | uid = model.uid + 1
                , field = ""
                , entries =
                    if String.isEmpty (String.trim model.field) then
                        model.entries

                    else
                        model.entries ++ [ newEntry (String.trim model.field) model.uid model.newType (1 + maxOrder model.entries) ]
              }
            , Cmd.none
            )

        UpdateField str ->
            ( { model | field = str }, Cmd.none )

        EditingEntry id True ->
            let
                backup =
                    List.filter (\t -> t.id == id) model.entries
                        |> List.head
                        |> Maybe.map (\t -> ( id, t.description ))
            in
            ( { model
                | entries = mapEntry id (\t -> { t | editing = True }) model.entries
                , editBackup = backup
                , confirmingDelete = Nothing
                , pressing = Nothing
              }
            , Task.attempt (\_ -> NoOp) (Dom.focus ("todo-" ++ String.fromInt id))
            )

        EditingEntry id False ->
            -- Commit; ignored unless the entry is still being edited (blur after Enter/Esc).
            if List.any (\t -> t.id == id && t.editing) model.entries then
                let
                    commit t =
                        { t | editing = False, description = String.trim t.description }

                    committed =
                        mapEntry id commit model.entries

                    edited t =
                        t.id == id && t.completed && t.description /= "" && Just t.description /= Maybe.map Tuple.second model.editBackup
                in
                ( { model
                    | entries = List.filter (\t -> t.id /= id || t.description /= "") committed
                    , editBackup = Nothing
                  }
                , if List.any edited committed then
                    withNow (Touched id)

                  else
                    Cmd.none
                )

            else
                ( model, Cmd.none )

        CancelEdit id ->
            let
                restore t =
                    case model.editBackup of
                        Just ( bid, original ) ->
                            if bid == id then
                                { t | editing = False, description = original }

                            else
                                { t | editing = False }

                        Nothing ->
                            { t | editing = False }
            in
            ( { model | entries = mapEntry id restore model.entries, editBackup = Nothing }
            , Cmd.none
            )

        UpdateEntry id desc ->
            ( { model | entries = mapEntry id (\t -> { t | description = desc }) model.entries }
            , Cmd.none
            )

        Delete id ->
            ( { model
                | entries = List.filter (\t -> t.id /= id) model.entries
                , confirmingDelete = Nothing
                , pressing = Nothing
              }
            , Cmd.none
            )

        DragStart id cx cy py immediate ->
            let
                seq =
                    model.pressSeq
            in
            ( { model
                | drag =
                    Just
                        { id = id
                        , seq = seq
                        , startX = cx
                        , startY = cy
                        , startPageY = py
                        , clientY = cy
                        , pageY = py
                        , active = immediate
                        , rects = []
                        , slot = -1
                        }
                , pressSeq = seq + 1
                , pressing = Nothing
                , confirmingDelete = Nothing
              }
            , if immediate then
                fetchRects seq model

              else
                Cmd.none
            )

        GotRects seq ids result ->
            case ( model.drag, result ) of
                ( Just d, Ok els ) ->
                    if d.seq == seq then
                        ( { model
                            | drag =
                                Just
                                    (withSlot
                                        { d
                                            | rects =
                                                List.map2
                                                    (\i el -> { id = i, top = el.element.y, height = el.element.height })
                                                    ids
                                                    els
                                        }
                                    )
                          }
                        , Cmd.none
                        )

                    else
                        ( model, Cmd.none )

                ( Just d, Err _ ) ->
                    if d.seq == seq then
                        ( { model | drag = Nothing }, Cmd.none )

                    else
                        ( model, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        DragMoved cx cy py ->
            case model.drag of
                Just d ->
                    let
                        far =
                            sqrt ((cx - d.startX) ^ 2 + (cy - d.startY) ^ 2) > 6
                    in
                    ( { model | drag = Just (withSlot { d | clientY = cy, pageY = py, active = d.active || far }) }
                    , if far && not d.active then
                        fetchRects d.seq model

                      else
                        Cmd.none
                    )

                Nothing ->
                    ( model, Cmd.none )

        DragEnded ->
            case model.drag of
                Just d ->
                    if d.active && not (List.isEmpty d.rects) then
                        moveTo d.id d.slot { model | drag = Nothing }

                    else
                        ( { model | drag = Nothing }, Cmd.none )

                Nothing ->
                    ( model, Cmd.none )

        DragCancel ->
            ( { model | drag = Nothing }, Cmd.none )

        DragFrame ->
            case model.drag of
                Just d ->
                    if d.active then
                        ( model, Task.perform GotViewport Dom.getViewport )

                    else
                        ( model, Cmd.none )

                Nothing ->
                    ( model, Cmd.none )

        GotViewport vp ->
            case model.drag of
                Just d ->
                    let
                        h =
                            vp.viewport.height

                        want =
                            if d.clientY < edgeZone then
                                -autoScrollStep

                            else if d.clientY > h - edgeZone then
                                autoScrollStep

                            else
                                0

                        newY =
                            clamp 0 (Basics.max 0 (vp.scene.height - h)) (vp.viewport.y + want)

                        delta =
                            newY - vp.viewport.y
                    in
                    if d.active && delta /= 0 then
                        ( { model | drag = Just (withSlot { d | pageY = d.pageY + delta }) }
                        , Task.perform (\_ -> NoOp) (Dom.setViewport vp.viewport.x newY)
                        )

                    else
                        ( model, Cmd.none )

                Nothing ->
                    ( model, Cmd.none )

        MoveBy id delta ->
            let
                ids =
                    List.map .id (visibleList model)
            in
            case indexOf id ids of
                Just i ->
                    let
                        ( m, cmd ) =
                            moveTo id (i + delta) model
                    in
                    ( m, Cmd.batch [ cmd, focusId ("check-" ++ String.fromInt id) ] )

                Nothing ->
                    ( model, Cmd.none )

        PressStart id x y ->
            ( { model
                | pressing = Just { id = id, seq = model.pressSeq, x = x, y = y }
                , pressSeq = model.pressSeq + 1
                , confirmingDelete = Nothing
              }
            , Process.sleep 500 |> Task.perform (\_ -> LongPress id model.pressSeq)
            )

        PressMove x y ->
            case model.pressing of
                Just p ->
                    if abs (x - p.x) > 10 || abs (y - p.y) > 10 then
                        ( { model | pressing = Nothing }, Cmd.none )

                    else
                        ( model, Cmd.none )

                Nothing ->
                    ( model, Cmd.none )

        PressEnd id ->
            -- A tap only edits while its press is still live; a fired long-press or cancelled press is ignored.
            case model.pressing of
                Just p ->
                    if p.id == id then
                        update (EditingEntry id True) { model | pressing = Nothing }

                    else
                        ( { model | pressing = Nothing }, Cmd.none )

                Nothing ->
                    ( model, Cmd.none )

        PressCancel ->
            ( { model | pressing = Nothing }, Cmd.none )

        LongPress id seq ->
            case model.pressing of
                Just p ->
                    if p.id == id && p.seq == seq then
                        ( { model | pressing = Nothing, confirmingDelete = Just id }, Cmd.none )

                    else
                        ( model, Cmd.none )

                Nothing ->
                    ( model, Cmd.none )

        DismissConfirm ->
            ( { model | confirmingDelete = Nothing, pressing = Nothing }, Cmd.none )

        ArchiveCompleted ->
            ( model, withNow ArchiveCompletedAt )

        ArchiveCompletedAt now ->
            ( { model
                | entries =
                    List.map
                        (\t ->
                            if t.completed && isLive t && inScope model.typeFilter t then
                                { t | archivedAt = Just now }

                            else
                                t
                        )
                        model.entries
              }
            , focusId "new-todo"
            )

        ArchiveItem id ->
            ( { model | confirmingDelete = Nothing, pressing = Nothing }, withNow (ArchiveItemAt id) )

        ArchiveItemAt id now ->
            ( { model
                | entries =
                    mapEntry id
                        (\t ->
                            if t.completed && isLive t then
                                { t | archivedAt = Just now }

                            else
                                t
                        )
                        model.entries
              }
            , Cmd.none
            )

        Restore id ->
            ( { model
                | entries =
                    mapEntry id
                        (\t -> { t | archivedAt = Nothing, completed = False, completedAt = Nothing, order = 1 + maxOrder model.entries })
                        model.entries
                , confirmingDelete = Nothing
                , pressing = Nothing
              }
            , Cmd.none
            )

        Touched id now ->
            ( { model | entries = mapEntry id (\t -> { t | completedAt = Just now }) model.entries }
            , Cmd.none
            )

        Check id isCompleted ->
            ( model, withNow (CheckAt id isCompleted) )

        CheckAt id isCompleted now ->
            ( { model | entries = mapEntry id (setCompleted isCompleted now) model.entries }
            , Cmd.none
            )

        CheckAll isCompleted ->
            ( model, withNow (CheckAllAt isCompleted) )

        CheckAllAt isCompleted now ->
            let
                setAll t =
                    if isLive t && inScope model.typeFilter t then
                        setCompleted isCompleted now t

                    else
                        t
            in
            ( { model | entries = List.map setAll model.entries }, Cmd.none )

        GotTime zone now ->
            ( { model | zone = zone, entries = model.entries |> migrate now |> sweep now }, Cmd.none )

        Tick now ->
            ( { model | entries = sweep now model.entries }, Cmd.none )

        SetNewType t ->
            ( { model | newType = t }
            , focusId "new-todo"
            )

        CycleNewType ->
            ( { model | newType = nextType model.newType }, Cmd.none )

        CycleEntryType id ->
            ( { model | entries = mapEntry id (\t -> { t | entryType = nextType t.entryType }) model.entries }
            , Cmd.none
            )

        SetTypeFilter f ->
            ( { model | typeFilter = f, typeMenuOpen = False }
            , focusId "tf-button"
            )

        ToggleTypeMenu ->
            if model.typeMenuOpen then
                ( { model | typeMenuOpen = False }, focusId "tf-button" )

            else
                ( { model | typeMenuOpen = True }
                , focusId ("tf-item-" ++ String.fromInt (menuIndex model.typeFilter))
                )

        OpenTypeMenu ->
            ( { model | typeMenuOpen = True }
            , focusId ("tf-item-" ++ String.fromInt (menuIndex model.typeFilter))
            )

        CloseTypeMenu ->
            ( { model | typeMenuOpen = False }, Cmd.none )

        CloseTypeMenuRefocus ->
            ( { model | typeMenuOpen = False }, focusId "tf-button" )

        FocusMenuItem i ->
            ( model, focusId ("tf-item-" ++ String.fromInt i) )

        ShowAll ->
            ( { model | typeFilter = AnyType, visibility = All, typeMenuOpen = False }
            , Cmd.batch [ Nav.pushUrl model.key "#/", focusId "new-todo" ]
            )

        UrlRequested req ->
            case req of
                Browser.Internal url ->
                    ( model, Nav.pushUrl model.key (Url.toString url) )

                Browser.External href ->
                    ( model, Nav.load href )

        UrlChanged url ->
            ( { model | visibility = visibilityFromUrl url, confirmingDelete = Nothing, pressing = Nothing }, Cmd.none )


{-| Row boxes for the visible rows, fetched once when a drag activates. -}
fetchRects : Int -> Model -> Cmd Msg
fetchRects seq model =
    let
        ids =
            List.map .id (visibleList model)
    in
    ids
        |> List.map (\i -> Dom.getElement ("row-" ++ String.fromInt i))
        |> Task.sequence
        |> Task.attempt (GotRects seq ids)


edgeZone : Float
edgeZone =
    60


autoScrollStep : Float
autoScrollStep =
    8


indexOf : a -> List a -> Maybe Int
indexOf x xs =
    xs
        |> List.indexedMap Tuple.pair
        |> List.filter (\( _, y ) -> y == x)
        |> List.head
        |> Maybe.map Tuple.first


{-| Index among the other visible rows where the dragged row would land: rows whose midpoint is above the pointer. -}
withSlot : Drag -> Drag
withSlot d =
    if List.isEmpty d.rects then
        d

    else
        { d
            | slot =
                d.rects
                    |> List.filter (\r -> r.id /= d.id && r.top + r.height / 2 < d.pageY)
                    |> List.length
        }


{-| Visible main-list rows, in display order. -}
visibleList : Model -> List Entry
visibleList model =
    model.entries
        |> List.filter (\e -> isLive e && inScope model.typeFilter e && isVisible model.visibility e)
        |> List.sortBy (\e -> ( e.order, e.id ))


{-| Move a row to final index `k` among the visible rows. All live entries are renumbered 0..n-1:
global order with the row removed, the row re-inserted right after visible neighbour k-1 (or first when k = 0),
so hidden rows keep their relative positions. No-op when the index does not change.
-}
moveTo : Int -> Int -> Model -> ( Model, Cmd Msg )
moveTo id k0 model =
    let
        visIds =
            List.map .id (visibleList model)

        n =
            List.length visIds

        k =
            clamp 0 (n - 1) k0
    in
    case indexOf id visIds of
        Just i ->
            if i == k || k0 < 0 || k0 >= n then
                ( model, Cmd.none )

            else
                let
                    live =
                        model.entries
                            |> List.filter isLive
                            |> List.sortBy (\e -> ( e.order, e.id ))

                    rest =
                        List.filter (\e -> e.id /= id) live

                    anchor =
                        visIds |> List.filter (\x -> x /= id) |> List.drop (k - 1) |> List.head

                    placed =
                        case ( List.filter (\e -> e.id == id) live |> List.head, anchor ) of
                            ( Just m, Just a ) ->
                                if k == 0 then
                                    m :: rest

                                else
                                    List.concatMap
                                        (\e ->
                                            if e.id == a then
                                                [ e, m ]

                                            else
                                                [ e ]
                                        )
                                        rest

                            ( Just m, Nothing ) ->
                                m :: rest

                            ( Nothing, _ ) ->
                                rest

                    newOrder =
                        placed |> List.indexedMap (\j e -> ( e.id, j ))
                in
                ( { model
                    | entries =
                        List.map
                            (\e ->
                                case List.filter (\( x, _ ) -> x == e.id) newOrder |> List.head of
                                    Just ( _, j ) ->
                                        { e | order = j }

                                    Nothing ->
                                        e
                            )
                            model.entries
                    , announce = "Moved to position " ++ String.fromInt (k + 1) ++ " of " ++ String.fromInt n
                  }
                , Cmd.none
                )

        Nothing ->
            ( model, Cmd.none )


{-| Unchanged when the state already matches, so a completedAt stamp is never refreshed by a no-op.
-}
setCompleted : Bool -> Time.Posix -> Entry -> Entry
setCompleted isCompleted now t =
    if t.completed == isCompleted then
        t

    else if isCompleted then
        { t | completed = True, completedAt = Just now }

    else
        { t | completed = False, completedAt = Nothing }


focusId : String -> Cmd Msg
focusId id =
    Task.attempt (\_ -> NoOp) (Dom.focus id)


menuFilters : List TypeFilter
menuFilters =
    AnyType :: List.map OnlyType allTypes


menuIndex : TypeFilter -> Int
menuIndex f =
    menuFilters
        |> List.indexedMap Tuple.pair
        |> List.filter (\( _, x ) -> x == f)
        |> List.head
        |> Maybe.map Tuple.first
        |> Maybe.withDefault 0


mapEntry : Int -> (Entry -> Entry) -> List Entry -> List Entry
mapEntry id f =
    List.map
        (\t ->
            if t.id == id then
                f t

            else
                t
        )



-- VIEW


view : Model -> Browser.Document Msg
view model =
    { title = "Elm • TodoMVC"
    , body =
        [ div [ classList [ ( "todomvc-wrapper", True ), ( "is-empty", List.isEmpty model.entries && model.visibility /= ArchiveView ) ] ]
            [ if model.visibility == ArchiveView then
                div [ class "archive-page" ] (viewArchive model)

              else
                section [ class "todoapp" ]
                    [ lazy2 viewInput model.field model.newType
                    , viewMain model
                    , if List.isEmpty model.entries then
                        text ""

                      else
                        viewControls model
                    ]
            , if model.visibility == ArchiveView then
                text ""

              else
                infoFooter
            ]
        ]
    }


viewMain : Model -> Html Msg
viewMain model =
    let
        scoped =
            List.filter (\e -> isLive e && inScope model.typeFilter e) model.entries

        live =
            List.filter isLive model.entries

        visible =
            visibleList model

        allCompleted =
            not (List.isEmpty scoped) && List.all .completed scoped

        cssVisibility empty =
            if empty then
                "hidden"

            else
                "visible"
    in
    section
        [ class "main"
        , style "visibility" (cssVisibility (List.isEmpty model.entries))
        ]
        [ input
            [ class "toggle-all"
            , type_ "checkbox"
            , name "toggle"
            , id "toggle-all"
            , checked allCompleted
            , onClick (CheckAll (not allCompleted))
            ]
            []
        , label
            [ for "toggle-all"
            , style "visibility" (cssVisibility (List.isEmpty scoped))
            ]
            [ text "Mark all as complete" ]
        , if List.isEmpty visible && not (List.isEmpty live) then
            viewEmptyFiltered model.visibility model.typeFilter (List.length live)

          else
            Keyed.ul
                [ classList
                    [ ( "todo-list", True )
                    , ( "drag-armed", model.drag /= Nothing )
                    , ( "drag-active", Maybe.map .active model.drag == Just True )
                    ]
                ]
                (viewRows model visible)
        , div [ class "drag-live", attribute "role" "status", attribute "aria-live" "polite" ] [ text model.announce ]
        ]


{-| How a row is displaced during a drag: not at all, floating with the pointer (the dragged row's card),
or shifted vertically to open the gap.
-}
type RowDrag
    = Still
    | Floating Float Float
    | Shifted Float


viewRows : Model -> List Entry -> List ( String, Html Msg )
viewRows model visible =
    let
        row t =
            viewKeyedEntry
                (model.typeFilter == AnyType)
                (model.confirmingDelete == Just t.id)
                (rowDrag model.drag t.id)
                t
    in
    List.map row visible


rowDrag : Maybe Drag -> Int -> RowDrag
rowDrag drag id =
    case drag of
        Just d ->
            if not d.active then
                Still

            else if d.id == id then
                Floating (d.pageY - d.startPageY) (slotOffset d)

            else
                let
                    dy =
                        gapShift d id
                in
                if dy == 0 then
                    Still

                else
                    Shifted dy

        Nothing ->
            Still


{-| How far the dragged row's slot sits from its origin: the summed heights of the rows it passed. -}
slotOffset : Drag -> Float
slotOffset d =
    let
        ids =
            List.map .id d.rects

        between lo hi =
            d.rects
                |> List.indexedMap Tuple.pair
                |> List.filter (\( i, _ ) -> i >= lo && i <= hi)
                |> List.map (Tuple.second >> .height)
                |> List.sum
    in
    case indexOf d.id ids of
        Just o ->
            if o < d.slot then
                between (o + 1) d.slot

            else if o > d.slot then
                -(between d.slot (o - 1))

            else
                0

        Nothing ->
            0


{-| Rows between the origin and the target slot move by the dragged row's height to open the gap:
up when the card goes down the list, down when it goes up. Uses the cached, untransformed boxes.
-}
gapShift : Drag -> Int -> Float
gapShift d id =
    let
        ids =
            List.map .id d.rects

        h =
            d.rects |> List.filter (\r -> r.id == d.id) |> List.head |> Maybe.map .height |> Maybe.withDefault 0
    in
    case ( indexOf d.id ids, indexOf id ids ) of
        ( Just o, Just i ) ->
            if o < d.slot && i > o && i <= d.slot then
                -h

            else if o > d.slot && i >= d.slot && i < o then
                h

            else
                0

        _ ->
            0


{-| Mouse/pen row drag: pointerdown anywhere on the row except checkbox, textarea, buttons and the handle.
Touch rows drag only from the handle (touch on the label stays tap / long-press).
-}
type alias Down =
    { pointerType : String
    , button : Int
    , x : Float
    , y : Float
    , pageY : Float
    }


downDecoder : Decoder Down
downDecoder =
    Decode.succeed Down
        |> andMap (Decode.field "pointerType" Decode.string)
        |> andMap (Decode.field "button" Decode.int)
        |> andMap (Decode.field "clientX" Decode.float)
        |> andMap (Decode.field "clientY" Decode.float)
        |> andMap (Decode.field "pageY" Decode.float)


onRowDown : Int -> Bool -> Attribute Msg
onRowDown id editing =
    on "pointerdown"
        (downDecoder
            |> Decode.andThen
                (\d ->
                    if editing || d.button /= 0 || d.pointerType == "touch" then
                        Decode.fail "not a mouse/pen primary press"

                    else
                        Decode.field "target" (climbToDraggable ())
                            |> Decode.andThen
                                (\ok ->
                                    if ok then
                                        Decode.succeed (DragStart id d.x d.y d.pageY False)

                                    else
                                        Decode.fail "interactive target"
                                )
                )
        )


onHandleDown : Int -> Attribute Msg
onHandleDown id =
    on "pointerdown"
        (downDecoder
            |> Decode.andThen
                (\d ->
                    if d.button /= 0 then
                        Decode.fail "not primary"

                    else
                        Decode.succeed (DragStart id d.x d.y d.pageY (d.pointerType == "touch"))
                )
        )


climbToDraggable : () -> Decoder Bool
climbToDraggable _ =
    Decode.field "tagName" Decode.string
        |> Decode.andThen
            (\tag ->
                if List.member tag [ "INPUT", "TEXTAREA", "BUTTON" ] then
                    Decode.succeed False

                else
                    Decode.field "className" (Decode.oneOf [ Decode.string, Decode.succeed "" ])
                        |> Decode.andThen
                            (\cls ->
                                if List.any (\c -> List.member c [ "drag-handle", "confirm-delete" ]) (String.words cls) then
                                    Decode.succeed False

                                else if tag == "LI" then
                                    Decode.succeed True

                                else
                                    Decode.oneOf
                                        [ Decode.field "parentElement" (Decode.lazy climbToDraggable)
                                        , Decode.succeed True
                                        ]
                            )
            )


{-| Alt+ArrowUp / Alt+ArrowDown moves the row one visible slot (not inside the edit textarea). -}
onRowKeydown : Int -> Attribute Msg
onRowKeydown id =
    preventDefaultOn "keydown"
        (Decode.map3 (\key alt tag -> ( key, alt, tag ))
            (Decode.field "key" Decode.string)
            (Decode.field "altKey" Decode.bool)
            (Decode.at [ "target", "tagName" ] Decode.string)
            |> Decode.andThen
                (\( key, alt, tag ) ->
                    if alt && tag /= "TEXTAREA" && key == "ArrowUp" then
                        Decode.succeed ( MoveBy id -1, True )

                    else if alt && tag /= "TEXTAREA" && key == "ArrowDown" then
                        Decode.succeed ( MoveBy id 1, True )

                    else
                        Decode.fail "ignored key"
                )
        )


{-| Touch rows: pointerdown starts a press (long-press timer), pointerup within it is a tap that edits,
pointermove past 10px or pointercancel (scroll) cancels. Mouse and pen are ignored.
-}
touchOnly : Decoder a -> Decoder a
touchOnly dec =
    Decode.field "pointerType" Decode.string
        |> Decode.andThen
            (\t ->
                if t == "touch" then
                    dec

                else
                    Decode.fail "not touch"
            )


onPressStart : Int -> Attribute Msg
onPressStart id =
    on "pointerdown"
        (touchOnly
            (Decode.map2 (PressStart id)
                (Decode.field "clientX" Decode.float)
                (Decode.field "clientY" Decode.float)
            )
        )


onPressMove : Attribute Msg
onPressMove =
    on "pointermove"
        (touchOnly
            (Decode.map2 PressMove
                (Decode.field "clientX" Decode.float)
                (Decode.field "clientY" Decode.float)
            )
        )


onPressEnd : Int -> Attribute Msg
onPressEnd id =
    on "pointerup" (touchOnly (Decode.succeed (PressEnd id)))


onPressCancel : Attribute Msg
onPressCancel =
    on "pointercancel" (touchOnly (Decode.succeed PressCancel))


{-| Suppress the long-press context menu for touch pointers only. -}
onTouchContextMenu : Attribute Msg
onTouchContextMenu =
    preventDefaultOn "contextmenu"
        (touchOnly (Decode.succeed ( NoOp, True )))


onKeyPrevent : List ( String, Msg ) -> Attribute Msg
onKeyPrevent table =
    let
        pick key =
            case List.filter (\( k, _ ) -> k == key) table |> List.head of
                Just ( _, msg ) ->
                    -- Tab keeps its default so focus can leave the menu.
                    Decode.succeed ( msg, key /= "Tab" )

                Nothing ->
                    Decode.fail "ignored key"
    in
    preventDefaultOn "keydown" (Decode.field "key" Decode.string |> Decode.andThen pick)


{-| Enter adds; Alt+T cycles type (and is swallowed so "†" is not typed).
Every other key fails the decoder: no message, no storage write.
-}
newTodoKeydown : Decoder ( Msg, Bool )
newTodoKeydown =
    Decode.map4
        (\key alt code shift ->
            if key == "Enter" && not shift then
                Decode.succeed ( Add, True )

            else if alt && (code == "KeyT" || key == "†") then
                Decode.succeed ( CycleNewType, True )

            else
                Decode.fail "ignored key"
        )
        (Decode.field "key" Decode.string)
        (Decode.field "altKey" Decode.bool)
        (Decode.field "code" Decode.string)
        (Decode.field "shiftKey" Decode.bool)
        |> Decode.andThen identity


{-| Enter saves (no newline typed), Shift+Enter inserts a newline, Escape cancels.
-}
onEditKeydown : Int -> Attribute Msg
onEditKeydown id =
    preventDefaultOn "keydown"
        (Decode.map2 Tuple.pair (Decode.field "key" Decode.string) (Decode.field "shiftKey" Decode.bool)
            |> Decode.andThen
                (\( key, shift ) ->
                    if key == "Enter" && not shift then
                        Decode.succeed ( EditingEntry id False, True )

                    else if key == "Escape" then
                        Decode.succeed ( CancelEdit id, False )

                    else
                        Decode.fail "ignored key"
                )
        )


viewMark : EntryType -> Html msg
viewMark t =
    span
        [ class
            ("mark mark-"
                ++ typeKey t
                ++ (case typeShape t of
                        Circle ->
                            " shape-circle"

                        Square ->
                            " shape-square"
                   )
            )
        , attribute "aria-hidden" "true"
        ]
        []



-- INPUT ROW


viewInput : String -> EntryType -> Html Msg
viewInput task newType =
    header [ class "header" ]
        [ h1 [] [ text "todos" ]
        , textarea
            [ class "new-todo"
            , rows 1
            , placeholder "What needs to be done?"
            , autofocus True
            , value task
            , name "newTodo"
            , id "new-todo"
            , attribute "aria-label" "New todo"
            , onInput UpdateField
            , preventDefaultOn "keydown" newTodoKeydown
            ]
            []
        , div [ class "type-picker-wrap" ]
            [ div
                [ class "type-picker"
                , attribute "role" "group"
                , attribute "aria-label" "Type for new todos"
                , title "Type for new todos (Alt+T)"
                ]
                (List.map (viewTypeChoice newType) allTypes)
            ]
        ]


viewTypeChoice : EntryType -> EntryType -> Html Msg
viewTypeChoice selected t =
    button
        [ type_ "button"
        , classList [ ( "type-choice", True ), ( "selected", selected == t ) ]
        , attribute "aria-label" (typeLabel t)
        , attribute "aria-pressed"
            (if selected == t then
                "true"

             else
                "false"
            )
        , onClick (SetNewType t)
        ]
        [ viewMark t, span [ class "label" ] [ text (typeLabel t) ] ]



-- EMPTY STATE


statusWord : Visibility -> String
statusWord v =
    case v of
        All ->
            ""

        Active ->
            "active"

        Completed ->
            "completed"

        ArchiveView ->
            ""


viewEmptyFiltered : Visibility -> TypeFilter -> Int -> Html Msg
viewEmptyFiltered visibility typeFilter total =
    let
        words =
            [ "No"
            , statusWord visibility
            , case typeFilter of
                AnyType ->
                    ""

                OnlyType t ->
                    typeLabel t
            , "todos."
            ]
                |> List.filter (not << String.isEmpty)
                |> String.join " "
    in
    div [ class "empty empty-filtered" ]
        [ p [ class "empty-title" ] [ text words ]
        , p [ class "empty-sub" ]
            [ text
                (if total == 1 then
                    "1 todo is hidden by the filter."

                 else
                    String.fromInt total ++ " todos are hidden by the filter."
                )
            ]
        ]



-- ENTRIES


isVisible : Visibility -> Entry -> Bool
isVisible visibility todo =
    case visibility of
        Completed ->
            todo.completed

        Active ->
            not todo.completed

        All ->
            True

        ArchiveView ->
            False


viewKeyedEntry : Bool -> Bool -> RowDrag -> Entry -> ( String, Html Msg )
viewKeyedEntry showMark confirming rd todo =
    ( String.fromInt todo.id, lazy4 viewEntry showMark confirming rd todo )


isFloating : RowDrag -> Bool
isFloating rd =
    case rd of
        Floating _ _ ->
            True

        _ ->
            False


viewEntry : Bool -> Bool -> RowDrag -> Entry -> Html Msg
viewEntry showMark confirming rd todo =
    li
        ([ classList
            [ ( "completed", todo.completed )
            , ( "editing", todo.editing )
            , ( "confirming", confirming )
            , ( "dragging", isFloating rd )
            ]
         , id ("row-" ++ String.fromInt todo.id)
         , onTouchContextMenu
         , onRowDown todo.id todo.editing
         , onRowKeydown todo.id
         ]
            ++ (case rd of
                    Shifted dy ->
                        [ style "transform" ("translateY(" ++ String.fromFloat dy ++ "px)") ]

                    Floating _ slotOff ->
                        [ style "transform" ("translateY(" ++ String.fromFloat slotOff ++ "px)") ]

                    _ ->
                        []
               )
        )
        [ div
            (class "view"
                :: (case rd of
                        Floating dy slotOff ->
                            [ style "transform" ("translateY(" ++ String.fromFloat (dy - slotOff) ++ "px) scale(1.04)") ]

                        _ ->
                            []
                   )
            )
            [ div [ class "drag-handle", attribute "aria-hidden" "true", onHandleDown todo.id ] [ text "\u{22EE}\u{22EE}" ]
            , input
                [ class "toggle"
                , id ("check-" ++ String.fromInt todo.id)
                , type_ "checkbox"
                , checked todo.completed
                , attribute "aria-label" "Completed"
                , onClick (Check todo.id (not todo.completed))
                ]
                []
            , label
                [ onDoubleClick (EditingEntry todo.id True)
                , onPressStart todo.id
                , onPressMove
                , onPressEnd todo.id
                , onPressCancel
                ]
                [ text todo.description ]
            , if showMark then
                button
                    [ class "row-type"
                    , type_ "button"
                    , attribute "aria-label" ("Type: " ++ typeLabel todo.entryType ++ ". Click to change.")
                    , onClick (CycleEntryType todo.id)
                    ]
                    [ span [ class "label" ] [ text (typeLabel todo.entryType) ], viewMark todo.entryType ]

              else
                text ""
            , if todo.completed then
                button
                    [ class "archive-item"
                    , type_ "button"
                    , attribute "aria-label" "Archive"
                    , title "Archive"
                    , onClick (ArchiveItem todo.id)
                    ]
                    []

              else
                text ""
            , button
                [ class "destroy"
                , type_ "button"
                , attribute "aria-label" "Delete"
                , onClick (Delete todo.id)
                ]
                []
            ]
        , textarea
            [ class "edit"
            , rows 1
            , value todo.description
            , name "title"
            , id ("todo-" ++ String.fromInt todo.id)
            , attribute "aria-label" "Edit todo"
            , onInput (UpdateEntry todo.id)
            , onBlur (EditingEntry todo.id False)
            , onEditKeydown todo.id
            ]
            []
        , if confirming then
            div [ class "confirm-delete", attribute "role" "group", attribute "aria-label" "Delete this todo?" ]
                [ if todo.completed then
                    button [ class "confirm-alt", type_ "button", onClick (ArchiveItem todo.id) ] [ text "Archive" ]

                  else
                    text ""
                , button [ class "confirm-yes", type_ "button", onClick (Delete todo.id) ] [ text "Delete" ]
                , button [ class "confirm-no", type_ "button", onClick DismissConfirm ] [ text "Cancel" ]
                ]

          else
            text ""
        ]



-- ARCHIVE VIEW


viewArchive : Model -> List (Html Msg)
viewArchive model =
    let
        archived =
            List.filter (\e -> isArchived e && inScope model.typeFilter e) model.entries

        showMark =
            model.typeFilter == AnyType
    in
    div [ class "archive-bar" ]
        [ a [ class "archive-back", href "#/" ] [ text "\u{2190} Back" ]
        , span [ class "archive-count", attribute "aria-live" "polite" ]
            [ text (String.fromInt (List.length archived) ++ " archived") ]
        , div [ class "archive-bar-menu" ] [ viewTypeMenu model.typeFilter model.typeMenuOpen ]
        ]
        :: (if List.isEmpty archived then
                [ section [ class "todoapp archive-card" ]
                    [ p [ class "archive-empty" ]
                        [ text
                            (case model.typeFilter of
                                OnlyType t ->
                                    if List.any isArchived model.entries then
                                        "No archived " ++ typeLabel t ++ " todos."

                                    else
                                        "Nothing archived yet."

                                AnyType ->
                                    "Nothing archived yet."
                            )
                        ]
                    ]
                ]

            else
                List.map (viewArchiveGroup model.zone showMark model.confirmingDelete) (archiveGroups model.zone archived)
           )


doneMs : Entry -> Int
doneMs e =
    case ( e.completedAt, e.archivedAt ) of
        ( Just t, _ ) ->
            Time.posixToMillis t

        ( Nothing, Just t ) ->
            Time.posixToMillis t

        _ ->
            0


monthNames : Time.Month -> ( String, String )
monthNames m =
    case m of
        Time.Jan ->
            ( "Jan", "January" )

        Time.Feb ->
            ( "Feb", "February" )

        Time.Mar ->
            ( "Mar", "March" )

        Time.Apr ->
            ( "Apr", "April" )

        Time.May ->
            ( "May", "May" )

        Time.Jun ->
            ( "Jun", "June" )

        Time.Jul ->
            ( "Jul", "July" )

        Time.Aug ->
            ( "Aug", "August" )

        Time.Sep ->
            ( "Sep", "September" )

        Time.Oct ->
            ( "Oct", "October" )

        Time.Nov ->
            ( "Nov", "November" )

        Time.Dec ->
            ( "Dec", "December" )


monthLabel : Time.Zone -> Entry -> String
monthLabel zone e =
    let
        t =
            Time.millisToPosix (doneMs e)
    in
    Tuple.second (monthNames (Time.toMonth zone t)) ++ " " ++ String.fromInt (Time.toYear zone t)


shortDate : Time.Zone -> Entry -> String
shortDate zone e =
    let
        t =
            Time.millisToPosix (doneMs e)
    in
    String.fromInt (Time.toDay zone t) ++ " " ++ Tuple.first (monthNames (Time.toMonth zone t))


{-| Grouped by month of completion, newest month first, newest first within a month.
-}
archiveGroups : Time.Zone -> List Entry -> List ( String, List Entry )
archiveGroups zone entries =
    groupSorted zone (List.sortBy (negate << doneMs) entries)


groupSorted : Time.Zone -> List Entry -> List ( String, List Entry )
groupSorted zone sorted =
    case sorted of
        [] ->
            []

        e :: _ ->
            let
                label =
                    monthLabel zone e

                ( same, others ) =
                    List.partition (\x -> monthLabel zone x == label) sorted
            in
            ( label, same ) :: groupSorted zone others


viewArchiveGroup : Time.Zone -> Bool -> Maybe Int -> ( String, List Entry ) -> Html Msg
viewArchiveGroup zone showMark confirmingId ( label, entries ) =
    section [ class "todoapp archive-card" ]
        [ h2 [ class "archive-month" ] [ text label ]
        , Keyed.ul [ class "todo-list" ]
            (List.map
                (\e -> ( String.fromInt e.id, lazy4 viewArchiveEntry zone showMark (confirmingId == Just e.id) e ))
                entries
            )
        ]


viewArchiveEntry : Time.Zone -> Bool -> Bool -> Entry -> Html Msg
viewArchiveEntry zone showMark confirming e =
    li
        [ classList [ ( "archive-row", True ), ( "confirming", confirming ) ]
        , onTouchContextMenu
        ]
        [ div
            [ class "view"
            , onPressStart e.id
            , onPressMove
            , on "pointerup" (touchOnly (Decode.succeed PressCancel))
            , onPressCancel
            ]
            [ label [] [ text e.description ]
            , if showMark then
                span [ class "archive-mark" ] [ viewMark e.entryType ]

              else
                text ""
            , div [ class "archive-actions" ]
                [ button [ class "archive-restore", type_ "button", onClick (Restore e.id) ] [ text "Restore" ]
                , button [ class "archive-delete", type_ "button", onClick (Delete e.id) ] [ text "Delete" ]
                ]
            , span [ class "archive-date" ] [ text (shortDate zone e) ]
            ]
        , if confirming then
            div [ class "confirm-delete", attribute "role" "group", attribute "aria-label" "Archived todo actions" ]
                [ button [ class "confirm-alt", type_ "button", onClick (Restore e.id) ] [ text "Restore" ]
                , button [ class "confirm-yes", type_ "button", onClick (Delete e.id) ] [ text "Delete" ]
                , button [ class "confirm-no", type_ "button", onClick DismissConfirm ] [ text "Cancel" ]
                ]

          else
            text ""
        ]



-- FOOTER


viewControls : Model -> Html Msg
viewControls model =
    let
        scoped =
            List.filter (\e -> isLive e && inScope model.typeFilter e) model.entries

        archivedCount =
            List.length (List.filter (\e -> isArchived e && inScope model.typeFilter e) model.entries)

        completed =
            List.length (List.filter .completed scoped)

        left =
            List.length scoped - completed

        hidden_ =
            List.length (List.filter isLive model.entries) - List.length (List.filter (isVisible model.visibility) scoped)
    in
    footer [ class "footer" ]
        [ lazy3 viewCount left (not (List.isEmpty scoped)) hidden_
        , viewFilters model
        , if completed > 0 then
            button [ type_ "button", class "clear-completed", onClick ArchiveCompleted ] [ text "Archive completed" ]

          else
            text ""
        , if archivedCount > 0 then
            a [ class "archive-link", href "#/archive" ] [ text ("Archive \u{00B7} " ++ String.fromInt archivedCount) ]

          else
            text ""
        ]


viewCount : Int -> Bool -> Int -> Html Msg
viewCount left anyInScope hidden_ =
    span
        [ class "todo-count"
        , attribute "aria-live" "polite"
        ]
        ((if left == 0 && anyInScope then
            [ text "All done" ]

          else
            [ strong [] [ text (String.fromInt left) ], text " left" ]
         )
            ++ (if hidden_ > 0 then
                    [ text ", "
                    , button
                        [ type_ "button"
                        , class "hidden-hint"
                        , title "Show all todos"
                        , attribute "aria-label" (String.fromInt hidden_ ++ " hidden. Show all todos")
                        , onClick ShowAll
                        ]
                        [ text (String.fromInt hidden_ ++ " hidden") ]
                    ]

                else
                    []
               )
        )


viewFilters : Model -> Html Msg
viewFilters model =
    ul [ class "filters" ]
        [ statusLink "#/" "All" (model.visibility == All)
        , text " "
        , statusLink "#/active" "Active" (model.visibility == Active)
        , text " "
        , statusLink "#/completed" "Completed" (model.visibility == Completed)
        , text " "
        , li [ class "type-filter-item" ] [ viewTypeMenu model.typeFilter model.typeMenuOpen ]
        ]


statusLink : String -> String -> Bool -> Html Msg
statusLink uri name_ isSelected =
    li []
        [ a
            [ href uri
            , classList [ ( "selected", isSelected ) ]
            , attribute "aria-current"
                (if isSelected then
                    "page"

                 else
                    "false"
                )
            ]
            [ text name_ ]
        ]


filterLabel : TypeFilter -> String
filterLabel f =
    case f of
        AnyType ->
            "All types"

        OnlyType t ->
            typeLabel t


viewTypeMenu : TypeFilter -> Bool -> Html Msg
viewTypeMenu current open =
    let
        buttonContent =
            case current of
                AnyType ->
                    [ text "All types" ]

                OnlyType t ->
                    [ viewMark t, text (typeLabel t) ]

        n =
            List.length menuFilters

        item i f =
            button
                [ type_ "button"
                , id ("tf-item-" ++ String.fromInt i)
                , tabindex -1
                , classList [ ( "menu-item", True ), ( "selected", f == current ) ]
                , attribute "role" "menuitemradio"
                , attribute "aria-checked"
                    (if f == current then
                        "true"

                     else
                        "false"
                    )
                , onClick (SetTypeFilter f)
                , preventDefaultOn "mousedown" (Decode.succeed ( NoOp, True ))
                , onKeyPrevent
                    [ ( "ArrowDown", FocusMenuItem (modBy n (i + 1)) )
                    , ( "ArrowUp", FocusMenuItem (modBy n (i - 1)) )
                    , ( "Home", FocusMenuItem 0 )
                    , ( "End", FocusMenuItem (n - 1) )
                    , ( "Escape", CloseTypeMenuRefocus )
                    , ( "Tab", CloseTypeMenu )
                    ]
                ]
                (case f of
                    AnyType ->
                        [ text "All types" ]

                    OnlyType t ->
                        [ viewMark t, text (typeLabel t) ]
                )

        leavesMenu =
            Decode.at [ "relatedTarget" ] (Decode.nullable (Decode.field "id" Decode.string))
                |> Decode.andThen
                    (\rel ->
                        case rel of
                            Just id ->
                                if String.startsWith "tf-" id then
                                    Decode.fail "still inside"

                                else
                                    Decode.succeed CloseTypeMenu

                            Nothing ->
                                Decode.succeed CloseTypeMenu
                    )
    in
    div [ class "type-menu-wrap", on "focusout" leavesMenu ]
        [ button
            [ type_ "button"
            , id "tf-button"
            , classList [ ( "type-filter-button", True ), ( "active", current /= AnyType ) ]
            , attribute "aria-haspopup" "menu"
            , attribute "aria-controls" "tf-menu"
            , attribute "aria-expanded"
                (if open then
                    "true"

                 else
                    "false"
                )
            , attribute "aria-label" ("Type filter: " ++ filterLabel current)
            , onClick ToggleTypeMenu
            , preventDefaultOn "mousedown" (Decode.succeed ( NoOp, True ))
            , onKeyPrevent
                [ ( "Escape", CloseTypeMenu )
                , ( "ArrowDown", OpenTypeMenu )
                , ( "ArrowUp", OpenTypeMenu )
                ]
            ]
            (buttonContent ++ [ span [ class "caret", attribute "aria-hidden" "true" ] [] ])
        , if open then
            div [ class "type-menu", id "tf-menu", attribute "role" "menu" ] (List.indexedMap item menuFilters)

          else
            text ""
        ]


infoFooter : Html msg
infoFooter =
    footer [ class "info" ]
        [ p [ class "hint-pointer" ] [ text "Double-click to edit a todo. Drag a row (or Alt+\u{2191}/\u{2193}) to reorder. Alt+T switches the type." ]
        , p [ class "hint-touch" ] [ text "Tap a todo to edit it. Press and hold to delete. Drag the handle to reorder." ]
        ]
