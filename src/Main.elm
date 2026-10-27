port module Main exposing (..)

{-| TodoMVC in Elm with user-configurable categories (see README "Categories").
-}

import Browser
import Browser.Dom as Dom
import Browser.Events
import Browser.Navigation as Nav
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Html.Keyed as Keyed
import Html.Lazy exposing (lazy3, lazy5, lazy7)
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


{-| Clipboard write (ports.js: navigator.clipboard, execCommand fallback); the result comes back on `copied`. -}
port copyText : String -> Cmd msg


port copied : (Bool -> msg) -> Sub msg


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


{-| Messages that never change persisted state (entries, field, uid, categories, nextCategoryId, newCategory,
categoryFilter); skip the storage write. StartEditCategory is excluded: it commits any open draft. -}
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

        GotMenuRoom _ _ _ ->
            True

        CopyMonth _ _ ->
            True

        Copied _ ->
            True

        CopyReset _ ->
            True

        FocusMenuItem _ _ ->
            True

        MenuPointer _ ->
            True

        ClearNoRing ->
            True

        Batch msgs ->
            List.all isTransient msgs

        EditCategoryName _ ->
            True

        UpdateNewCatName _ ->
            True

        ToggleMenu _ ->
            True

        OpenMenu _ ->
            True

        CloseMenu _ ->
            True

        CloseMenuRefocus _ ->
            True

        CancelEditCategory _ ->
            True

        DismissConfirm ->
            True

        SetStatus _ ->
            True

        OpenArchive ->
            True

        OpenManage ->
            True

        UrlRequested _ ->
            True

        PressMove _ _ ->
            True

        _ ->
            False



-- CATEGORIES


type Shape
    = Circle
    | Square
    | Diamond
    | Triangle


{-| A user category. `color` is a palette slot 0..7 (`--cat-N` in css/types.css); `shape` is the second
visual channel for colour-blind users, assigned round-robin by creation order.
-}
type alias Category =
    { id : Int
    , name : String
    , color : Int
    , shape : Shape
    }


paletteSize : Int
paletteSize =
    8


paletteNames : List String
paletteNames =
    [ "Blue", "Orange", "Green", "Pink", "Purple", "Teal", "Ochre", "Brown" ]


maxCategories : Int
maxCategories =
    12


allShapes : List Shape
allShapes =
    [ Circle, Square, Diamond, Triangle ]


shapeKey : Shape -> String
shapeKey s =
    case s of
        Circle ->
            "circle"

        Square ->
            "square"

        Diamond ->
            "diamond"

        Triangle ->
            "triangle"


shapeFromKey : String -> Maybe Shape
shapeFromKey k =
    List.filter (\s -> shapeKey s == k) allShapes |> List.head


{-| Round-robin by creation order: ids are handed out sequentially from 1. -}
shapeForId : Int -> Shape
shapeForId id =
    List.drop (modBy (List.length allShapes) (id - 1)) allShapes |> List.head |> Maybe.withDefault Circle


findCategory : List Category -> Int -> Maybe Category
findCategory cats id =
    List.filter (\c -> c.id == id) cats |> List.head


categoryName : List Category -> Maybe Int -> String
categoryName cats mid =
    mid |> Maybe.andThen (findCategory cats) |> Maybe.map .name |> Maybe.withDefault "None"


{-| The new-todo picker follows the category filter: a specific category or "No category" presets it; Any leaves it. -}
followFilter : CategoryFilter -> Maybe Int -> Maybe Int
followFilter f current =
    case f of
        OnlyCategory id ->
            Just id

        NoCategory ->
            Nothing

        AnyCategory ->
            current


{-| Cycle: Nothing -> first category -> ... -> last -> Nothing. An unknown id restarts at Nothing. -}
nextCategory : List Category -> Maybe Int -> Maybe Int
nextCategory cats current =
    let
        ids =
            List.map .id cats
    in
    case current of
        Nothing ->
            List.head ids

        Just id ->
            case indexOf id ids of
                Just i ->
                    List.drop (i + 1) ids |> List.head

                Nothing ->
                    Nothing


{-| Drop a category reference that no longer resolves. -}
validCategory : List Category -> Maybe Int -> Maybe Int
validCategory cats mid =
    case mid of
        Just id ->
            if findCategory cats id == Nothing then
                Nothing

            else
                mid

        Nothing ->
            Nothing


validFilter : List Category -> CategoryFilter -> CategoryFilter
validFilter cats f =
    case f of
        OnlyCategory id ->
            if findCategory cats id == Nothing then
                AnyCategory

            else
                f

        NoCategory ->
            if List.isEmpty cats then
                AnyCategory

            else
                f

        AnyCategory ->
            f


normName : String -> String
normName =
    String.trim >> String.toLower


{-| Why a (trimmed) name is not acceptable for category `self` (Nothing = a new one), if it is not. -}
nameProblem : List Category -> Maybe Int -> String -> Maybe String
nameProblem cats self raw =
    if String.isEmpty (String.trim raw) then
        Just "Name can\u{2019}t be empty"

    else if List.any (\c -> Just c.id /= self && normName c.name == normName raw) cats then
        Just "Name already used"

    else
        Nothing


{-| First palette slot no category uses yet (cycles once all are taken). -}
freeColor : List Category -> Int -> Int
freeColor cats id =
    List.range 0 (paletteSize - 1)
        |> List.filter (\i -> not (List.any (\c -> c.color == i) cats))
        |> List.head
        |> Maybe.withDefault (modBy paletteSize (id - 1))



-- MODEL


type Visibility
    = All
    | Active
    | Completed
    | ArchiveView
    | ManageView


type CategoryFilter
    = AnyCategory
    | OnlyCategory Int
    | NoCategory


type alias Model =
    { entries : List Entry
    , field : String
    , uid : Int
    , categories : List Category
    , nextCategoryId : Int
    , newCategory : Maybe Int
    , visibility : Visibility
    , categoryFilter : CategoryFilter
    , newCatName : String
    , addError : Maybe String
    , editingCat : Maybe ( Int, String )
    , confirmingCategory : Maybe Int
    , returnTo : String
    , editBackup : Maybe ( Int, String )
    , menuOpen : Maybe Which
    , menuPointer : Bool
    , noRing : Maybe Which
    , menuDown : Bool
    , copyPending : Maybe String
    , copyFlash : Maybe ( String, Bool )
    , copySeq : Int
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
    , category : Maybe Int
    , completedAt : Maybe Time.Posix
    , archivedAt : Maybe Time.Posix
    , order : Int
    }


newEntry : String -> Int -> Maybe Int -> Int -> Entry
newEntry desc id t order =
    { description = desc
    , completed = False
    , editing = False
    , id = id
    , category = t
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

        Just "/categories" ->
            ManageView

        Just "/all" ->
            All

        -- "#/", "#/active" and unknown hashes
        _ ->
            Active


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
      , categories = saved.categories
      , nextCategoryId = saved.nextCategoryId
      , newCategory = followFilter saved.categoryFilter saved.newCategory
      , visibility = visibilityFromUrl url
      , categoryFilter = saved.categoryFilter
      , newCatName = ""
      , addError = Nothing
      , editingCat = Nothing
      , confirmingCategory = Nothing
      , returnTo = "#/active"
      , editBackup = Nothing
      , menuOpen = Nothing
      , menuPointer = False
      , noRing = Nothing
      , menuDown = False
      , copyPending = Nothing
      , copyFlash = Nothing
      , copySeq = 0
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
    , categories : List Category
    , nextCategoryId : Int
    , newCategory : Maybe Int
    , categoryFilter : CategoryFilter
    }


emptySaved : Saved
emptySaved =
    { entries = []
    , field = ""
    , uid = 0
    , categories = []
    , nextCategoryId = 1
    , newCategory = Nothing
    , categoryFilter = AnyCategory
    }


{-| An entry plus its legacy `"type"` key (data saved before categories), if any. -}
entryDecoder : Decoder ( Entry, Maybe String )
entryDecoder =
    Decode.map2 Tuple.pair
        (Decode.succeed Entry
            |> andMap (Decode.field "description" Decode.string)
            |> andMap (Decode.field "completed" Decode.bool)
            |> andMap (Decode.succeed False)
            |> andMap (Decode.field "id" Decode.int)
            |> andMap (lenientField "category" (Decode.nullable Decode.int) Nothing)
            |> andMap (optionalTime "completedAt")
            |> andMap (optionalTime "archivedAt")
            |> andMap (lenientField "order" Decode.int -1)
        )
        (lenientField "type" (Decode.map Just Decode.string) Nothing)


{-| Missing or malformed field decodes as the fallback. -}
lenientField : String -> Decoder a -> a -> Decoder a
lenientField name dec fallback =
    Decode.oneOf [ Decode.field name dec, Decode.succeed fallback ]


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


lenientList : Decoder a -> Decoder (List a)
lenientList dec =
    Decode.list (Decode.oneOf [ Decode.map Just dec, Decode.succeed Nothing ])
        |> Decode.map (List.filterMap identity)


{-| Invalid colour falls back to a slot derived from the id; missing/unknown shape to the round-robin one. -}
categoryDecoder : Decoder Category
categoryDecoder =
    Decode.map4
        (\id name color shape ->
            { id = id
            , name = String.trim name
            , color =
                if color >= 0 && color < paletteSize then
                    color

                else
                    modBy paletteSize (id - 1)
            , shape = shape |> Maybe.andThen shapeFromKey |> Maybe.withDefault (shapeForId id)
            }
        )
        (Decode.field "id" Decode.int)
        (Decode.field "name" Decode.string)
        (lenientField "color" Decode.int -1)
        (lenientField "shape" (Decode.map Just Decode.string) Nothing)


{-| Drops nameless and duplicate (id or case-insensitive name) categories, caps at the limit. -}
cleanCategories : List Category -> List Category
cleanCategories =
    List.foldl
        (\c acc ->
            if String.isEmpty c.name || List.any (\x -> x.id == c.id || normName x.name == normName c.name) acc then
                acc

            else
                acc ++ [ c ]
        )
        []
        >> List.take maxCategories


filterDecoder : Decoder CategoryFilter
filterDecoder =
    Decode.oneOf
        [ Decode.map OnlyCategory Decode.int
        , Decode.string
            |> Decode.map
                (\k ->
                    if k == "none" then
                        NoCategory

                    else
                        AnyCategory
                )
        , Decode.succeed AnyCategory
        ]


legacyCategories : List Category
legacyCategories =
    [ { id = 1, name = "Personal", color = 0, shape = Circle }
    , { id = 2, name = "Work", color = 1, shape = Square }
    ]


legacyId : String -> Maybe Int
legacyId key =
    case key of
        "personal" ->
            Just 1

        "work" ->
            Just 2

        _ ->
            Nothing


{-| Stored `categories` wins. Without it, legacy `"type": "personal" | "work"` on any entry creates
Personal (1) and Work (2) and maps entries, `newType` and `typeFilter`; otherwise there are no categories.
Every reference is then checked against the category list (dangling -> none / All).
-}
savedDecoder : Decoder Saved
savedDecoder =
    Decode.map4
        (\pairs field uid stored ->
            Decode.map5
                (\newCat filter legacyNew legacyFilter nextStored ->
                    let
                        legacy =
                            stored == Nothing && List.any (\( _, t ) -> Maybe.andThen legacyId t /= Nothing) pairs

                        cats =
                            if legacy then
                                legacyCategories

                            else
                                Maybe.withDefault [] stored

                        entries =
                            List.map
                                (\( e, t ) ->
                                    { e
                                        | category =
                                            validCategory cats
                                                (if legacy then
                                                    Maybe.andThen legacyId t

                                                 else if stored == Nothing then
                                                    Nothing

                                                 else
                                                    e.category
                                                )
                                    }
                                )
                                pairs
                    in
                    { entries = entries
                    , field = field
                    , uid = uid
                    , categories = cats
                    , nextCategoryId = Basics.max nextStored (1 + (List.map .id cats |> List.maximum |> Maybe.withDefault 0))
                    , newCategory =
                        validCategory cats
                            (if legacy then
                                Maybe.andThen legacyId legacyNew

                             else
                                newCat
                            )
                    , categoryFilter =
                        validFilter cats
                            (if legacy then
                                legacyFilter |> Maybe.andThen legacyId |> Maybe.map OnlyCategory |> Maybe.withDefault AnyCategory

                             else
                                filter
                            )
                    }
                )
                (lenientField "newCategory" (Decode.nullable Decode.int) Nothing)
                (lenientField "categoryFilter" filterDecoder AnyCategory)
                (lenientField "newType" (Decode.map Just Decode.string) Nothing)
                (lenientField "typeFilter" (Decode.map Just Decode.string) Nothing)
                (lenientField "nextCategoryId" Decode.int 1)
        )
        (lenientField "entries" (lenientList entryDecoder) [])
        (lenientField "field" Decode.string "")
        (lenientField "uid" Decode.int 0)
        (Decode.oneOf
            [ Decode.field "categories" (Decode.map (Just << cleanCategories) (lenientList categoryDecoder))
            , Decode.succeed Nothing
            ]
        )
        |> Decode.andThen identity


encodeEntry : Entry -> Encode.Value
encodeEntry e =
    Encode.object
        [ ( "description", Encode.string e.description )
        , ( "completed", Encode.bool e.completed )
        , ( "id", Encode.int e.id )
        , ( "category", maybeInt e.category )
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
        , ( "categories", Encode.list encodeCategory m.categories )
        , ( "nextCategoryId", Encode.int m.nextCategoryId )
        , ( "newCategory", maybeInt m.newCategory )
        , ( "categoryFilter"
          , case m.categoryFilter of
                AnyCategory ->
                    Encode.string "all"

                NoCategory ->
                    Encode.string "none"

                OnlyCategory id ->
                    Encode.int id
          )
        ]


encodeCategory : Category -> Encode.Value
encodeCategory c =
    Encode.object
        [ ( "id", Encode.int c.id )
        , ( "name", Encode.string c.name )
        , ( "color", Encode.int c.color )
        , ( "shape", Encode.string (shapeKey c.shape) )
        ]


maybeInt : Maybe Int -> Encode.Value
maybeInt =
    Maybe.map Encode.int >> Maybe.withDefault Encode.null



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
    | GotTime Time.Zone Time.Posix
    | Tick Time.Posix
    | SetNewCategory (Maybe Int)
    | CycleNewCategory
    | SetEntryCategory Int (Maybe Int)
    | SetCategoryFilter CategoryFilter
    | OpenManage
    | UpdateNewCatName String
    | AddCategory
    | StartEditCategory Int
    | EditCategoryName String
    | CommitCategory Int
    | BlurCategory Int
    | CancelEditCategory Int
    | SetCategoryColor Int Int
    | MoveCategory Int Int
    | AskDeleteCategory Int
    | DeleteCategory Int
    | ToggleMenu Which
    | OpenMenu Which
    | CloseMenu Which
    | CloseMenuRefocus Which
    | FocusMenuItem Which Int
    | MenuPointer Bool
    | ClearNoRing
    | Batch (List Msg)
    | GotMenuRoom Which Float Float
    | SetStatus Visibility
    | OpenArchive
    | CopyMonth String String
    | Copied Bool
    | CopyReset Int
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


inScope : CategoryFilter -> Entry -> Bool
inScope filter e =
    case filter of
        AnyCategory ->
            True

        OnlyCategory id ->
            e.category == Just id

        NoCategory ->
            e.category == Nothing


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch [ Time.every (60 * 60 * 1000) Tick, confirmSubs model, dragSubs model, copied Copied ]


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
    case ( model.confirmingDelete, model.confirmingCategory ) of
        ( Nothing, Nothing ) ->
            Sub.none

        _ ->
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

        Batch msgs ->
            List.foldl
                (\m ( mdl, cmds ) ->
                    let
                        ( next, cmd ) =
                            update m mdl
                    in
                    ( next, Cmd.batch [ cmds, cmd ] )
                )
                ( model, Cmd.none )
                msgs

        Add ->
            ( { model
                | uid = model.uid + 1
                , field = ""
                , entries =
                    if String.isEmpty (String.trim model.field) then
                        model.entries

                    else
                        model.entries ++ [ newEntry (String.trim model.field) model.uid (validCategory model.categories model.newCategory) (1 + maxOrder model.entries) ]
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
                | menuOpen = Nothing
                , drag =
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
            ( { model | confirmingDelete = Nothing, pressing = Nothing, confirmingCategory = Nothing }
            , case model.confirmingCategory of
                Just cid ->
                    focusId ("cat-del-" ++ String.fromInt cid)

                Nothing ->
                    Cmd.none
            )

        ArchiveCompleted ->
            ( model, withNow ArchiveCompletedAt )

        ArchiveCompletedAt now ->
            ( { model
                | entries =
                    List.map
                        (\t ->
                            if t.completed && isLive t && inScope model.categoryFilter t then
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

        GotTime zone now ->
            ( { model | zone = zone, entries = model.entries |> migrate now |> sweep now }, Cmd.none )

        Tick now ->
            ( { model | entries = sweep now model.entries }, Cmd.none )

        SetNewCategory c ->
            ( { model | newCategory = c }
            , focusId "new-todo"
            )

        CycleNewCategory ->
            ( { model | newCategory = nextCategory model.categories model.newCategory }, Cmd.none )

        SetEntryCategory id cat ->
            ( { model | entries = mapEntry id (\t -> { t | category = cat }) model.entries, menuOpen = Nothing, noRing = pickRing (RowMenu id) model }
            , focusId (menuPrefix (RowMenu id) ++ "button")
            )

        SetCategoryFilter f ->
            ( { model | categoryFilter = f, newCategory =
                    if f == model.categoryFilter then
                        model.newCategory

                    else
                        followFilter f model.newCategory
                , menuOpen = Nothing, noRing = pickRing CatMenu model }
            , focusId "tf-button"
            )

        OpenManage ->
            ( { model | menuOpen = Nothing }, Nav.pushUrl model.key "#/categories" )

        UpdateNewCatName str ->
            ( { model | newCatName = str, addError = Nothing }, Cmd.none )

        AddCategory ->
            let
                name_ =
                    String.trim model.newCatName

                id =
                    model.nextCategoryId
            in
            if String.isEmpty name_ then
                ( model, Cmd.none )

            else if List.length model.categories >= maxCategories then
                ( { model | addError = Just ("Limit is " ++ String.fromInt maxCategories ++ " categories") }, Cmd.none )

            else
                case nameProblem model.categories Nothing name_ of
                    Just problem ->
                        ( { model | addError = Just problem }, Cmd.none )

                    Nothing ->
                        ( { model
                            | categories =
                                model.categories
                                    ++ [ { id = id, name = name_, color = freeColor model.categories id, shape = shapeForId id } ]
                            , nextCategoryId = id + 1
                            , newCatName = ""
                            , addError = Nothing
                          }
                        , focusId "cat-new"
                        )

        StartEditCategory id ->
            -- One row at a time: a row still in edit state is committed (or, if invalid, reverted) first.
            case findCategory model.categories id of
                Just c ->
                    ( { model | categories = commitDraft model, editingCat = Just ( id, c.name ), confirmingCategory = Nothing }
                    , focusId ("cat-name-" ++ String.fromInt id)
                    )

                Nothing ->
                    ( model, Cmd.none )

        EditCategoryName raw ->
            ( { model | editingCat = Maybe.map (\( id, _ ) -> ( id, raw )) model.editingCat }, Cmd.none )

        CommitCategory id ->
            -- Enter: an invalid name keeps the row in edit state with its message.
            case model.editingCat of
                Just ( eid, raw ) ->
                    if eid == id && nameProblem model.categories (Just id) raw == Nothing then
                        ( { model | categories = commitDraft model, editingCat = Nothing }
                        , focusId ("cat-label-" ++ String.fromInt id)
                        )

                    else
                        ( model, Cmd.none )

                Nothing ->
                    ( model, Cmd.none )

        BlurCategory id ->
            -- Leaving the row commits a valid name and drops an invalid one.
            if Maybe.map Tuple.first model.editingCat == Just id then
                ( { model | categories = commitDraft model, editingCat = Nothing }, Cmd.none )

            else
                ( model, Cmd.none )

        CancelEditCategory id ->
            if Maybe.map Tuple.first model.editingCat == Just id then
                ( { model | editingCat = Nothing }, focusId ("cat-label-" ++ String.fromInt id) )

            else
                ( model, Cmd.none )

        SetCategoryColor id color ->
            ( { model
                | categories =
                    List.map
                        (\c ->
                            if c.id == id then
                                { c | color = clamp 0 (paletteSize - 1) color }

                            else
                                c
                        )
                        model.categories
              }
            , Cmd.none
            )

        MoveCategory id delta ->
            let
                ids =
                    List.map .id model.categories

                n =
                    List.length ids
            in
            case indexOf id ids of
                Just i ->
                    let
                        j =
                            clamp 0 (n - 1) (i + delta)

                        others =
                            List.filter (\c -> c.id /= id) model.categories

                        moved =
                            List.filter (\c -> c.id == id) model.categories

                        -- Keep focus on the pressed arrow unless it is now disabled at the edge.
                        target =
                            if delta < 0 && j > 0 then
                                "cat-up-"

                            else if delta > 0 && j < n - 1 then
                                "cat-down-"

                            else if delta < 0 then
                                "cat-down-"

                            else
                                "cat-up-"
                    in
                    ( { model | categories = List.take j others ++ moved ++ List.drop j others }
                    , focusId (target ++ String.fromInt id)
                    )

                Nothing ->
                    ( model, Cmd.none )

        AskDeleteCategory id ->
            ( { model | confirmingCategory = Just id, categories = commitDraft model, editingCat = Nothing }, focusId "cat-cancel" )

        DeleteCategory id ->
            let
                cats =
                    List.filter (\c -> c.id /= id) model.categories
            in
            ( { model
                | categories = cats
                , entries =
                    List.map
                        (\e ->
                            if e.category == Just id then
                                { e | category = Nothing }

                            else
                                e
                        )
                        model.entries
                , categoryFilter = validFilter cats model.categoryFilter
                , newCategory = validCategory cats model.newCategory
                , confirmingCategory = Nothing
                , editingCat = Nothing
              }
            , focusId "cat-new"
            )

        ToggleMenu which ->
            if model.menuOpen == Just which then
                ( { model | menuOpen = Nothing }, focusId (menuPrefix which ++ "button") )

            else
                openMenu which model

        OpenMenu which ->
            openMenu which model

        GotMenuRoom _ above menuHeight ->
            -- Measured after render: open upwards unless the menu (plus its 8px gap) does not fit above the button.
            ( { model | menuDown = above < menuHeight + 8 }, Cmd.none )

        CloseMenu which ->
            if model.menuOpen == Just which then
                ( { model | menuOpen = Nothing }, Cmd.none )

            else
                ( model, Cmd.none )

        CloseMenuRefocus which ->
            ( { model | menuOpen = Nothing }, focusId (menuPrefix which ++ "button") )

        FocusMenuItem which i ->
            -- Arrow keys mean keyboard use: the pick that follows keeps the focus ring.
            ( { model | menuPointer = False }, focusId (menuPrefix which ++ "item-" ++ String.fromInt i) )

        MenuPointer on ->
            if model.menuPointer == on then
                ( model, Cmd.none )

            else
                ( { model | menuPointer = on }, Cmd.none )

        ClearNoRing ->
            if model.noRing == Nothing then
                ( model, Cmd.none )

            else
                ( { model | noRing = Nothing }, Cmd.none )

        CopyMonth month txt ->
            -- One copy in flight at a time, so a result can't land on a different month's button.
            if model.copyPending /= Nothing then
                ( model, Cmd.none )

            else
                ( { model | copyPending = Just month }, copyText txt )

        Copied ok ->
            -- Each result restarts the 1.5s label; only the latest timer clears it, so rapid clicks don't flicker.
            case model.copyPending of
                Just month ->
                    ( { model | copyPending = Nothing, copyFlash = Just ( month, ok ), copySeq = model.copySeq + 1 }
                    , Process.sleep 1500 |> Task.perform (\_ -> CopyReset (model.copySeq + 1))
                    )

                Nothing ->
                    ( model, Cmd.none )

        CopyReset seq ->
            if seq == model.copySeq then
                ( { model | copyFlash = Nothing }, Cmd.none )

            else
                ( model, Cmd.none )

        OpenArchive ->
            ( { model | menuOpen = Nothing }, Nav.pushUrl model.key "#/archive" )

        SetStatus v ->
            ( { model | menuOpen = Nothing, noRing = pickRing StatusMenu model }
            , if v == model.visibility then
                focusId "sm-button"

              else
                Cmd.batch [ Nav.pushUrl model.key (statusHash v), focusId "sm-button" ]
            )

        UrlRequested req ->
            case req of
                Browser.Internal url ->
                    ( model, Nav.pushUrl model.key (Url.toString url) )

                Browser.External href ->
                    ( model, Nav.load href )

        UrlChanged url ->
            let
                v =
                    visibilityFromUrl url
            in
            ( { model
                | visibility = v
                , confirmingDelete = Nothing
                , confirmingCategory = Nothing
                , editingCat = Nothing
                , addError = Nothing
                , pressing = Nothing
                , menuOpen = Nothing
                , returnTo =
                    case model.visibility of
                        Active ->
                            "#/active"

                        Completed ->
                            "#/completed"

                        All ->
                            "#/all"

                        _ ->
                            model.returnTo
              }
            , if v == ManageView && model.visibility /= ManageView then
                case model.categories of
                    c :: _ ->
                        focusId ("cat-label-" ++ String.fromInt c.id)

                    [] ->
                        focusId "cat-new"

              else
                Cmd.none
            )


{-| After a pointer pick the button is refocused (for a11y) without the focus ring. -}
pickRing : Which -> Model -> Maybe Which
pickRing which model =
    if model.menuPointer then
        Just which

    else
        Nothing


type Which
    = StatusMenu
    | CatMenu
    | RowMenu Int


menuPrefix : Which -> String
menuPrefix which =
    case which of
        StatusMenu ->
            "sm-"

        CatMenu ->
            "tf-"

        RowMenu id ->
            -- Trailing dash keeps "rm-1-" from prefixing "rm-12-...".
            "rm-" ++ String.fromInt id ++ "-"


statusOrder : List Visibility
statusOrder =
    [ Active, Completed, All ]


statusHash : Visibility -> String
statusHash v =
    case v of
        Completed ->
            "#/completed"

        All ->
            "#/all"

        _ ->
            "#/active"


openMenu : Which -> Model -> ( Model, Cmd Msg )
openMenu which model =
    let
        prefix =
            menuPrefix which

        current =
            case which of
                StatusMenu ->
                    indexOf model.visibility statusOrder |> Maybe.withDefault 0

                CatMenu ->
                    menuIndex model.categories model.categoryFilter

                RowMenu id ->
                    model.entries
                        |> List.filter (\e -> e.id == id)
                        |> List.head
                        |> Maybe.andThen (\e -> indexOf e.category (rowMenuChoices model.categories))
                        |> Maybe.withDefault 0
    in
    ( { model | menuOpen = Just which }
    , Cmd.batch
        [ focusId (prefix ++ "item-" ++ String.fromInt current)
        , Task.map2 Tuple.pair (Dom.getElement (prefix ++ "button")) (Dom.getElement (prefix ++ "menu"))
            |> Task.attempt
                (\r ->
                    case r of
                        Ok ( btn, menu ) ->
                            GotMenuRoom which (btn.element.y - btn.viewport.y) menu.element.height

                        Err _ ->
                            NoOp
                )
        ]
    )


{-| Categories with the row in edit state applied, when its draft name is valid. -}
commitDraft : Model -> List Category
commitDraft model =
    case model.editingCat of
        Just ( id, raw ) ->
            if nameProblem model.categories (Just id) raw == Nothing then
                List.map
                    (\c ->
                        if c.id == id then
                            { c | name = String.trim raw }

                        else
                            c
                    )
                    model.categories

            else
                model.categories

        Nothing ->
            model.categories


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
        |> List.filter (\e -> isLive e && inScope model.categoryFilter e && isVisible model.visibility e)
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


menuFilters : List Category -> List CategoryFilter
menuFilters cats =
    AnyCategory :: List.map (OnlyCategory << .id) cats ++ [ NoCategory ]


menuIndex : List Category -> CategoryFilter -> Int
menuIndex cats f =
    indexOf f (menuFilters cats) |> Maybe.withDefault 0


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
        [ div [ classList [ ( "todomvc-wrapper", True ), ( "is-empty", List.isEmpty model.entries && not (isSubPage model.visibility) ) ] ]
            [ case model.visibility of
                ArchiveView ->
                    div [ class "archive-page" ] (viewArchive model)

                ManageView ->
                    div [ class "archive-page manage-page" ] (viewManage model)

                _ ->
                    div [ class "app-stack" ]
                        [ section [ class "todoapp" ]
                            [ lazy3 viewInput model.field model.categories model.newCategory
                            , viewMain model
                            ]
                        , if List.any isLive model.entries then
                            viewControls model

                          else
                            text ""
                        ]
            ]
        ]
    }


isSubPage : Visibility -> Bool
isSubPage v =
    v == ArchiveView || v == ManageView


viewMain : Model -> Html Msg
viewMain model =
    let
        live =
            List.filter isLive model.entries

        visible =
            visibleList model

        cssVisibility empty =
            if empty then
                "hidden"

            else
                "visible"
    in
    section
        [ class "main"
        , classList [ ( "row-menu-open", isRowMenu model.menuOpen ) ]
        , style "visibility" (cssVisibility (List.isEmpty live))
        , style "display"
            (if List.isEmpty live then
                "none"

             else
                "block"
            )
        ]
        [ if List.isEmpty visible && not (List.isEmpty live) then
            viewEmptyFiltered model.visibility model.categories model.categoryFilter (List.length live)

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
                model.categories
                (model.categoryFilter == AnyCategory && not (List.isEmpty model.categories))
                (model.confirmingDelete == Just t.id)
                (rowDrag model.drag t.id)
                (if model.menuOpen == Just (RowMenu t.id) then
                    Just model.menuDown

                 else
                    Nothing
                )
                (model.noRing == Just (RowMenu t.id))
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
                                if List.any (\c -> List.member c [ "drag-handle", "confirm-delete", "type-menu" ]) (String.words cls) then
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


{-| Menu-item keys: like onKeyPrevent, but Alt+key is left to the row (reorder) and handled keys don't bubble. -}
menuKeys : List ( String, Msg ) -> Attribute Msg
menuKeys table =
    custom "keydown"
        (Decode.map2 Tuple.pair (Decode.field "key" Decode.string) (Decode.field "altKey" Decode.bool)
            |> Decode.andThen
                (\( key, alt ) ->
                    case ( alt, List.filter (\( k, _ ) -> k == key) table |> List.head ) of
                        ( False, Just ( _, msg ) ) ->
                            -- Tab keeps its default so focus can leave the menu.
                            Decode.succeed { message = msg, preventDefault = key /= "Tab", stopPropagation = True }

                        _ ->
                            Decode.fail "ignored key"
                )
        )


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
                Decode.succeed ( CycleNewCategory, True )

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


viewMark : Maybe Category -> Html msg
viewMark mc =
    case mc of
        Just c ->
            span [ class ("mark cat-" ++ String.fromInt c.color ++ " shape-" ++ shapeKey c.shape), attribute "aria-hidden" "true" ] []

        Nothing ->
            span [ class "mark mark-none", attribute "aria-hidden" "true" ] []


markFor : List Category -> Maybe Int -> Html msg
markFor cats mid =
    viewMark (Maybe.andThen (findCategory cats) mid)



-- INPUT ROW


viewInput : String -> List Category -> Maybe Int -> Html Msg
viewInput task cats newCat =
    header [ classList [ ( "header", True ), ( "no-picker", List.isEmpty cats ) ] ]
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
        , if List.isEmpty cats then
            text ""

          else
            div [ class "type-picker-wrap" ]
                [ div
                    [ class "type-picker"
                    , attribute "role" "group"
                    , attribute "aria-label" "Category for new todos"
                    , title "Category for new todos (Alt+T)"
                    ]
                    (List.map (viewTypeChoice cats newCat) (Nothing :: List.map (Just << .id) cats))
                ]
        ]


viewTypeChoice : List Category -> Maybe Int -> Maybe Int -> Html Msg
viewTypeChoice cats selected choice =
    button
        [ type_ "button"
        , classList [ ( "type-choice", True ), ( "selected", selected == choice ) ]
        , attribute "aria-label" (categoryName cats choice)
        , attribute "aria-pressed"
            (if selected == choice then
                "true"

             else
                "false"
            )
        , onClick (SetNewCategory choice)
        ]
        [ markFor cats choice, span [ class "label" ] [ text (categoryName cats choice) ] ]



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

        ManageView ->
            ""


{-| How a category scope reads inside a sentence ("No active Work todos."). -}
scopeWord : List Category -> CategoryFilter -> String
scopeWord cats f =
    case f of
        AnyCategory ->
            ""

        OnlyCategory id ->
            categoryName cats (Just id)

        NoCategory ->
            "uncategorised"


viewEmptyFiltered : Visibility -> List Category -> CategoryFilter -> Int -> Html Msg
viewEmptyFiltered visibility cats filter total =
    let
        words =
            [ "No"
            , statusWord visibility
            , scopeWord cats filter
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

        ManageView ->
            False


viewKeyedEntry : List Category -> Bool -> Bool -> RowDrag -> Maybe Bool -> Bool -> Entry -> ( String, Html Msg )
viewKeyedEntry cats showMark confirming rd menu ringless todo =
    ( String.fromInt todo.id, lazy7 viewEntry cats showMark confirming rd menu ringless todo )


isFloating : RowDrag -> Bool
isFloating rd =
    case rd of
        Floating _ _ ->
            True

        _ ->
            False


{-| `menu` is the row category menu: Nothing when closed, Just down when open. -}
viewEntry : List Category -> Bool -> Bool -> RowDrag -> Maybe Bool -> Bool -> Entry -> Html Msg
viewEntry cats showMark confirming rd menu ringless todo =
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
                let
                    mc =
                        Maybe.andThen (findCategory cats) todo.category
                in
                -- No category: a hollow ring that only shows on row hover / focus (faint on touch); opens the menu.
                viewRowCategoryMenu cats menu ringless todo mc

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
            List.filter (\e -> isArchived e && inScope model.categoryFilter e) model.entries

        showMark =
            model.categoryFilter == AnyCategory && not (List.isEmpty model.categories)
    in
    div [ class "archive-bar" ]
        [ a [ class "archive-back", href model.returnTo ] [ text "\u{2190} Back" ]
        , span [ class "archive-count", attribute "aria-live" "polite" ]
            [ text (String.fromInt (List.length archived) ++ " archived") ]
        , if List.isEmpty model.categories then
            text ""

          else
            div [ class "archive-bar-menu" ] [ viewCategoryMenu False model (List.filter isArchived model.entries) ]
        ]
        :: (if List.isEmpty archived then
                [ section [ class "todoapp archive-card" ]
                    [ p [ class "archive-empty" ]
                        [ text
                            (if model.categoryFilter /= AnyCategory && List.any isArchived model.entries then
                                "No archived " ++ scopeWord model.categories model.categoryFilter ++ " todos."

                             else
                                "Nothing archived yet."
                            )
                        ]
                    ]
                ]

            else
                List.map (viewArchiveGroup model showMark) (archiveGroups model.zone archived)
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


viewArchiveGroup : Model -> Bool -> ( String, List Entry ) -> Html Msg
viewArchiveGroup model showMark ( label, entries ) =
    let
        flash =
            case model.copyFlash of
                Just ( month, ok ) ->
                    if month == label then
                        Just ok

                    else
                        Nothing

                Nothing ->
                    Nothing
    in
    section [ class "todoapp archive-card" ]
        [ h2 [ class "archive-month" ] [ text label ]
        , button
            [ type_ "button"
            , classList [ ( "copy-summary", True ), ( "flash", flash /= Nothing ) ]
            , title "Copy this month as a prompt for a summary"
            , onClick (CopyMonth label (summaryPrompt model label entries))
            ]
            [ icon "copy"
            , span [ attribute "aria-live" "polite" ]
                [ text
                    (case flash of
                        Just True ->
                            "Copied"

                        Just False ->
                            "Copy failed"

                        Nothing ->
                            "Copy for summary"
                    )
                ]
            ]
        , Keyed.ul [ class "todo-list" ]
            (List.map
                (\e -> ( String.fromInt e.id, lazy5 viewArchiveEntry model.zone model.categories showMark (model.confirmingDelete == Just e.id) e ))
                entries
            )
        ]


{-| Clipboard text for one month card: a prompt line, then the card's todos as shown. With a category filter
the category is named once in the prompt; otherwise each categorised line carries a [Category] bracket.
-}
summaryPrompt : Model -> String -> List Entry -> String
summaryPrompt model month entries =
    let
        prompt =
            case model.categoryFilter of
                AnyCategory ->
                    "Summarise what I got done in " ++ month ++ ". Group by theme, mention the categories, and keep it under 150 words."

                OnlyCategory id ->
                    "Summarise my " ++ categoryName model.categories (Just id) ++ " todos from " ++ month ++ ". Group by theme and keep it under 150 words."

                NoCategory ->
                    "Summarise my uncategorised todos from " ++ month ++ ". Group by theme and keep it under 150 words."

        bracket e =
            case ( model.categoryFilter, Maybe.andThen (findCategory model.categories) e.category ) of
                ( AnyCategory, Just c ) ->
                    "[" ++ c.name ++ "] "

                _ ->
                    ""

        line e =
            "- " ++ bracket e ++ String.join " " (String.words e.description) ++ " (completed " ++ shortDate model.zone e ++ ")"
    in
    String.join "\n" (prompt :: "" :: List.map line entries)


viewArchiveEntry : Time.Zone -> List Category -> Bool -> Bool -> Entry -> Html Msg
viewArchiveEntry zone cats showMark confirming e =
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
            , if showMark && Maybe.andThen (findCategory cats) e.category /= Nothing then
                span [ class "archive-mark" ] [ markFor cats e.category ]

              else
                text ""
            , div [ class "archive-actions" ]
                [ button [ class "archive-restore", type_ "button", onClick (Restore e.id) ] [ icon "restore", text "Restore" ]
                , button [ class "archive-delete", type_ "button", onClick (Delete e.id) ] [ icon "x", text "Delete" ]
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



-- MANAGE CATEGORIES VIEW


viewManage : Model -> List (Html Msg)
viewManage model =
    let
        n =
            List.length model.categories
    in
    [ div [ class "archive-bar" ]
        [ a [ class "archive-back", href model.returnTo ] [ text "\u{2190} Back" ]
        , span [ class "archive-count" ] [ text (String.fromInt n ++ " of " ++ String.fromInt maxCategories) ]
        ]
    , section [ class "todoapp archive-card manage-card" ]
        [ h2 [ class "archive-month" ] [ text "Categories" ]
        , Keyed.ul [ class "cat-list" ]
            (List.indexedMap (\i c -> ( String.fromInt c.id, viewCategoryRow model n i c )) model.categories)
        , div [ class "cat-add" ]
            [ span [ class "cat-preview" ] [ icon "plus" ]
            , input
                [ id "cat-new"
                , class "cat-name"
                , type_ "text"
                , placeholder "Add category"
                , value model.newCatName
                , maxlength 40
                , autocomplete False
                , attribute "aria-label" "New category name"
                , attribute "aria-describedby" "cat-new-error"
                , attribute "aria-invalid"
                    (if model.addError == Nothing then
                        "false"

                     else
                        "true"
                    )
                , onInput UpdateNewCatName
                , onKeyPrevent [ ( "Enter", AddCategory ) ]
                ]
                []
            , button [ class "cat-add-btn", type_ "button", onClick AddCategory ] [ text "Add" ]
            ]
        , p [ class "cat-error", id "cat-new-error", attribute "aria-live" "polite" ]
            [ text (Maybe.withDefault "" model.addError) ]
        ]
    ]


{-| A category row. At rest: mark + name (a button; click / Enter edits) and hover-revealed ↑ ↓ ×.
Editing (one row at a time): the name becomes a text input and the colour strip appears under it.
Focus moving between the input and the swatches keeps the row in edit state.
-}
viewCategoryRow : Model -> Int -> Int -> Category -> Html Msg
viewCategoryRow model n i c =
    let
        sid =
            String.fromInt c.id

        inputId =
            "cat-name-" ++ sid

        draft =
            case model.editingCat of
                Just ( eid, raw ) ->
                    if eid == c.id then
                        Just raw

                    else
                        Nothing

                Nothing ->
                    Nothing

        problem =
            draft |> Maybe.andThen (nameProblem model.categories (Just c.id))

        used =
            List.length (List.filter (\e -> e.category == Just c.id) model.entries)

        ownsId elId =
            elId == inputId || String.startsWith (inputId ++ "-sw-") elId

        -- Only focus leaving the input / swatches counts; the name button's blur while it is swapped
        -- for the input (it bubbles to this row) must not end the edit it just started.
        stillInside =
            Decode.at [ "target", "id" ] Decode.string
                |> Decode.andThen
                    (\tid ->
                        if ownsId tid then
                            Decode.at [ "relatedTarget" ] (Decode.nullable (Decode.field "id" Decode.string))

                        else
                            Decode.fail "not ours"
                    )
                |> Decode.andThen
                    (\rel ->
                        case rel of
                            Just relId ->
                                if ownsId relId then
                                    Decode.fail "still editing"

                                else
                                    Decode.succeed (BlurCategory c.id)

                            Nothing ->
                                Decode.succeed (BlurCategory c.id)
                    )

        swatch idx colorName =
            button
                [ type_ "button"
                , id (inputId ++ "-sw-" ++ String.fromInt idx)
                , classList [ ( "swatch", True ), ( "selected", c.color == idx ) ]
                , attribute "role" "radio"
                , attribute "aria-checked"
                    (if c.color == idx then
                        "true"

                     else
                        "false"
                    )
                , attribute "aria-label" colorName
                , title colorName
                , onClick (SetCategoryColor c.id idx)
                , preventDefaultOn "mousedown" (Decode.succeed ( NoOp, True ))
                , onKeyPrevent [ ( "Escape", CancelEditCategory c.id ) ]
                ]
                [ span [ class ("swatch-dot cat-" ++ String.fromInt idx) ] [] ]

        tools =
            [ button
                [ id ("cat-up-" ++ sid)
                , class "cat-icon cat-tool"
                , type_ "button"
                , disabled (i == 0)
                , attribute "aria-label" ("Move " ++ c.name ++ " up")
                , onClick (MoveCategory c.id -1)
                ]
                [ text "\u{2191}" ]
            , button
                [ id ("cat-down-" ++ sid)
                , class "cat-icon cat-tool"
                , type_ "button"
                , disabled (i == n - 1)
                , attribute "aria-label" ("Move " ++ c.name ++ " down")
                , onClick (MoveCategory c.id 1)
                ]
                [ text "\u{2193}" ]
            , button
                [ id ("cat-del-" ++ sid)
                , class "cat-icon cat-tool cat-delete"
                , type_ "button"
                , attribute "aria-label" ("Delete " ++ c.name)
                , stopPropagationOn "click" (Decode.succeed ( AskDeleteCategory c.id, True ))
                ]
                [ icon "x" ]
            ]
    in
    if model.confirmingCategory == Just c.id then
        li [ class "cat-row confirming" ]
            [ div [ class "confirm-delete cat-confirm", attribute "role" "group", attribute "aria-label" "Delete category?" ]
                [ p [ class "cat-confirm-text" ] [ text (deleteCategoryText used) ]
                , div [ class "cat-confirm-actions" ]
                    [ button [ class "confirm-yes", id "cat-confirm", type_ "button", onClick (DeleteCategory c.id) ] [ text "Delete" ]
                    , button [ class "confirm-no", id "cat-cancel", type_ "button", onClick DismissConfirm ] [ text "Cancel" ]
                    ]
                ]
            ]

    else
        case draft of
            Nothing ->
                Keyed.node "li"
                    [ class "cat-row" ]
                    [ ( "line", div [ class "cat-line" ]
                        [ span [ class "cat-preview" ] [ viewMark (Just c) ]
                        , button
                            [ id ("cat-label-" ++ sid)
                            , class ("cat-label " ++ catText c)
                            , type_ "button"
                            , attribute "aria-label" ("Edit " ++ c.name)
                            , onClick (StartEditCategory c.id)
                            ]
                            [ text c.name ]
                        ]
                      )
                    , ( "tools", div [ class "cat-tools" ] tools )
                    ]

            Just raw ->
                Keyed.node "li"
                    [ class "cat-row editing", on "focusout" stillInside ]
                    [ ( "line", div [ class "cat-line" ]
                        [ span [ class "cat-preview" ] [ viewMark (Just c) ]
                        , input
                                [ id inputId
                                , class "cat-name"
                                , type_ "text"
                                , value raw
                                , maxlength 40
                                , autocomplete False
                                , attribute "aria-label" "Category name"
                                , attribute "aria-describedby" ("cat-error-" ++ sid)
                                , attribute "aria-invalid"
                                    (if problem == Nothing then
                                        "false"

                                     else
                                        "true"
                                    )
                                , onInput EditCategoryName
                                , onKeyPrevent [ ( "Enter", CommitCategory c.id ), ( "Escape", CancelEditCategory c.id ) ]
                                ]
                                []
                        ]
                      )
                    -- One keyed child for everything edit-only: Elm's keyed diff only detects a single removed
                    -- node per step, so two siblings disappearing at once would recreate the tools (losing focus).
                    , ( "edit"
                      , div [ class "cat-edit" ]
                            [ div [ class "cat-swatches", attribute "role" "radiogroup", attribute "aria-label" ("Colour of " ++ c.name) ]
                                (List.indexedMap swatch paletteNames)
                            , p [ class "cat-error", id ("cat-error-" ++ sid), attribute "aria-live" "polite" ]
                                [ text (Maybe.withDefault "" problem) ]
                            ]
                      )

                    -- After the swatches in DOM order so Tab goes input -> colours -> tools; placed top-right by CSS.
                    , ( "tools", div [ class "cat-tools" ] tools )
                    ]


deleteCategoryText : Int -> String
deleteCategoryText used =
    if used == 0 then
        "Delete category? No todos use it."

    else if used == 1 then
        "Delete category? Its 1 todo keeps its text and loses the category."

    else
        "Delete category? Its " ++ String.fromInt used ++ " todos keep their text and lose the category."



-- FIXED CONTROLS


{-| Filter line below the card, outside it: the status and category menus centred; "Archive all" at the right
end, Completed view only.
-}
viewControls : Model -> Html Msg
viewControls model =
    let
        scoped =
            List.filter (\e -> isLive e && inScope model.categoryFilter e) model.entries

        completed =
            List.length (List.filter .completed scoped)

        statusScoped =
            List.filter (\e -> isLive e && isVisible model.visibility e) model.entries
    in
    div [ class "filter-line" ]
        [ div [ class "filter-menus" ]
            [ viewStatusMenu model scoped
            , if List.isEmpty model.categories then
                a [ class "add-categories", href "#/categories" ] [ icon "plus", text "Add categories\u{2026}" ]

              else
                viewCategoryMenu True model statusScoped
            ]
        , if model.visibility == Completed && completed > 0 then
            button [ type_ "button", class "clear-completed", onClick ArchiveCompleted ] [ icon "archive", text "Archive all" ]

          else
            text ""
        ]


{-| A 16px line icon (CSS mask, currentColor). Decorative: always next to a text label or inside a labelled button. -}
icon : String -> Html msg
icon name =
    span [ class ("icon icon-" ++ name), attribute "aria-hidden" "true" ] []


statusIcon : Visibility -> Html msg
statusIcon v =
    case v of
        Completed ->
            icon "completed"

        All ->
            icon "all"

        _ ->
            icon "active"


statusName : Visibility -> String
statusName v =
    case v of
        Completed ->
            "Completed"

        All ->
            "All"

        _ ->
            "Active"


{-| Status menu; counts are within the current category scope (`scoped`). -}
viewStatusMenu : Model -> List Entry -> Html Msg
viewStatusMenu model scoped =
    let
        row v =
            { content = [ span [ class "menu-mark" ] [ statusIcon v ], span [ class "menu-label" ] [ text (statusName v) ] ]
            , count = Just (List.length (List.filter (isVisible v) scoped))
            , selected = Just (model.visibility == v)
            , pick = SetStatus v
            , divider = False
            }

        -- Archived todos in the current category scope; the row only exists when there are some.
        archivedCount =
            List.length (List.filter (\e -> isArchived e && inScope model.categoryFilter e) model.entries)

        archivedRow =
            { content = [ span [ class "menu-mark" ] [ icon "archive" ], span [ class "menu-label" ] [ text "Archived" ] ]
            , count = Just archivedCount
            , selected = Nothing
            , pick = OpenArchive
            , divider = True
            }
    in
    viewMenu StatusMenu
        { wrapClass = ""
        , buttonClass = "menu-button"
        , noRing = model.noRing == Just StatusMenu
        , open = model.menuOpen == Just StatusMenu
        , down = model.menuDown
        , label = "Status: " ++ statusName model.visibility
        , deviates = model.visibility /= Active
        , buttonContent = [ statusIcon model.visibility, text (statusName model.visibility) ]
        , rows =
            List.map row statusOrder
                ++ (if archivedCount > 0 then
                        [ archivedRow ]

                    else
                        []
                   )
        }


{-| Category menu; counts are within the current status scope (`base`). `withEdit` adds "Manage categories…" (main view only). -}
viewCategoryMenu : Bool -> Model -> List Entry -> Html Msg
viewCategoryMenu withEdit model base =
    let
        cats =
            model.categories

        current =
            model.categoryFilter

        content f =
            case f of
                AnyCategory ->
                    [ icon "any", text "Any category" ]

                OnlyCategory id ->
                    [ markFor cats (Just id), span [ class "tf-name" ] [ text (categoryName cats (Just id)) ] ]

                NoCategory ->
                    [ icon "dash", text "No category" ]

        -- Menu rows: fixed 16px mark slot so labels line up. Any: hollow ring; No category: dash.
        rowContent f =
            [ span [ class "menu-mark" ]
                (case f of
                    AnyCategory ->
                        [ icon "any" ]

                    OnlyCategory id ->
                        [ markFor cats (Just id) ]

                    NoCategory ->
                        [ icon "dash" ]
                )
            , span [ class ("menu-label tf-name" ++ labelColour (Maybe.andThen (findCategory cats) (filterId f))) ] [ text (filterLabel cats f) ]
            ]

        row f =
            { content = rowContent f
            , count = Just (List.length (List.filter (inScope f) base))
            , selected = Just (f == current)
            , pick = SetCategoryFilter f
            , divider = False
            }

        edit =
            { content = [ span [ class "menu-mark" ] [ icon "gear" ], span [ class "menu-label" ] [ text "Manage categories\u{2026}" ] ]
            , count = Nothing
            , selected = Nothing
            , pick = OpenManage
            , divider = True
            }
    in
    viewMenu CatMenu
        { wrapClass = ""
        , buttonClass =
            -- A set category shows its name in its own palette colour; "No category" keeps the red accent.
            case current of
                OnlyCategory id ->
                    case findCategory cats id of
                        Just c ->
                            "menu-button " ++ catText c

                        Nothing ->
                            "menu-button"

                _ ->
                    "menu-button"
        , noRing = model.noRing == Just CatMenu
        , open = model.menuOpen == Just CatMenu
        , down = model.menuDown
        , label = "Category filter: " ++ filterLabel cats current
        , deviates = current /= AnyCategory
        , buttonContent = content current
        , rows =
            List.map row (menuFilters cats)
                ++ (if withEdit then
                        [ edit ]

                    else
                        []
                   )
        }


isRowMenu : Maybe Which -> Bool
isRowMenu w =
    case w of
        Just (RowMenu _) ->
            True

        _ ->
            False


{-| Text in the category's palette colour (`--cat-N`). -}
catText : Category -> String
catText c =
    "cat-text-" ++ String.fromInt c.color


{-| Extra class for a menu label: a real category shows in its own colour; Any / No category stay neutral. -}
labelColour : Maybe Category -> String
labelColour mc =
    case mc of
        Just c ->
            " " ++ catText c

        Nothing ->
            ""


filterId : CategoryFilter -> Maybe Int
filterId f =
    case f of
        OnlyCategory id ->
            Just id

        _ ->
            Nothing


rowMenuChoices : List Category -> List (Maybe Int)
rowMenuChoices cats =
    Nothing :: List.map (Just << .id) cats


{-| Row category control: the mark opens a menu of "No category" + each category; the current one has a check. -}
viewRowCategoryMenu : List Category -> Maybe Bool -> Bool -> Entry -> Maybe Category -> Html Msg
viewRowCategoryMenu cats menu ringless todo mc =
    let
        row choice =
            { content =
                [ span [ class "menu-mark" ] [ markFor cats choice ]
                , span [ class ("menu-label tf-name" ++ labelColour (Maybe.andThen (findCategory cats) choice)) ]
                    [ text
                        (if choice == Nothing then
                            "No category"

                         else
                            categoryName cats choice
                        )
                    ]
                ]
            , count = Nothing
            , selected = Just (choice == todo.category)
            , pick = SetEntryCategory todo.id choice
            , divider = False
            }
    in
    viewMenu (RowMenu todo.id)
        { wrapClass =
            if mc == Nothing then
                "row-cat row-cat-none"

            else
                "row-cat"
        , buttonClass = "row-type"
        , noRing = ringless
        , open = menu /= Nothing
        , down = Maybe.withDefault False menu
        , label = "Category: " ++ categoryName cats todo.category ++ ". Change category"
        , deviates = False
        , buttonContent =
            case mc of
                Just c ->
                    [ span [ class ("label " ++ catText c) ] [ text c.name ], viewMark mc ]

                Nothing ->
                    [ viewMark Nothing ]
        , rows = List.map row (rowMenuChoices cats)
        }


filterLabel : List Category -> CategoryFilter -> String
filterLabel cats f =
    case f of
        AnyCategory ->
            "Any category"

        OnlyCategory id ->
            categoryName cats (Just id)

        NoCategory ->
            "No category"


type alias MenuRow =
    { content : List (Html Msg)
    , count : Maybe Int
    , selected : Maybe Bool
    , pick : Msg
    , divider : Bool
    }


type alias MenuSpec =
    { wrapClass : String
    , buttonClass : String
    , noRing : Bool
    , open : Bool
    , down : Bool
    , label : String
    , deviates : Bool
    , buttonContent : List (Html Msg)
    , rows : List MenuRow
    }


{-| Button keys: Esc / arrows as before. Any key also marks keyboard use (the next pick keeps the ring)
and drops a pending no-ring. Enter/Space keep their default so they fire click.
-}
menuButtonKeys : Which -> Attribute Msg
menuButtonKeys which =
    let
        kb rest =
            Batch (ClearNoRing :: MenuPointer False :: rest)

        handled msg =
            Decode.succeed { message = kb [ msg ], preventDefault = True, stopPropagation = True }
    in
    custom "keydown"
        (Decode.map2 Tuple.pair (Decode.field "key" Decode.string) (Decode.field "altKey" Decode.bool)
            |> Decode.andThen
                (\( key, alt ) ->
                    if alt then
                        -- Alt+arrows belong to the row (reorder).
                        Decode.fail "alt"

                    else
                        case key of
                            "Escape" ->
                                handled (CloseMenu which)

                            "ArrowDown" ->
                                handled (OpenMenu which)

                            "ArrowUp" ->
                                handled (OpenMenu which)

                            _ ->
                                Decode.succeed { message = kb [], preventDefault = False, stopPropagation = False }
                )
        )


{-| Dropdown shared by the status and category menus. Ids: `<prefix>button`, `<prefix>menu`, `<prefix>item-N`.
Enter/Space/ArrowDown open; arrows wrap, Home/End, Esc closes and refocuses the button, Tab closes.
-}
viewMenu : Which -> MenuSpec -> Html Msg
viewMenu which spec =
    let
        prefix =
            menuPrefix which

        n =
            List.length spec.rows

        item i r =
            [ if r.divider then
                div [ class "menu-sep", attribute "role" "separator" ] []

              else
                text ""
            , button
                ([ type_ "button"
                 , id (prefix ++ "item-" ++ String.fromInt i)
                 , tabindex -1
                 , classList
                    [ ( "menu-item", True )
                    , ( "selected", r.selected == Just True )
                    , ( "menu-edit", r.selected == Nothing )
                    ]
                 , onClick r.pick
                 , on "pointerdown" (Decode.succeed (MenuPointer True))
                 , preventDefaultOn "mousedown" (Decode.succeed ( NoOp, True ))
                 , menuKeys
                    [ ( "ArrowDown", FocusMenuItem which (modBy n (i + 1)) )
                    , ( "ArrowUp", FocusMenuItem which (modBy n (i - 1)) )
                    , ( "Home", FocusMenuItem which 0 )
                    , ( "End", FocusMenuItem which (n - 1) )
                    , ( "Escape", CloseMenuRefocus which )
                    , ( "Tab", CloseMenu which )
                    ]
                 ]
                    ++ (case r.selected of
                            Just sel ->
                                [ attribute "role" "menuitemradio"
                                , attribute "aria-checked"
                                    (if sel then
                                        "true"

                                     else
                                        "false"
                                    )
                                ]

                            Nothing ->
                                [ attribute "role" "menuitem" ]
                       )
                )
                ((case r.selected of
                    Just sel ->
                        [ span [ class "menu-check", attribute "aria-hidden" "true" ]
                            [ text
                                (if sel then
                                    "\u{2713}"

                                 else
                                    ""
                                )
                            ]
                        ]

                    Nothing ->
                        []
                 )
                    ++ r.content
                    ++ (case r.count of
                            Just c ->
                                [ span [ class "menu-count" ] [ text (String.fromInt c) ] ]

                            Nothing ->
                                []
                       )
                )
            ]

        leavesMenu =
            Decode.at [ "relatedTarget" ] (Decode.nullable (Decode.field "id" Decode.string))
                |> Decode.andThen
                    (\rel ->
                        case rel of
                            Just relId ->
                                if String.startsWith prefix relId then
                                    Decode.fail "still inside"

                                else
                                    Decode.succeed (CloseMenu which)

                            Nothing ->
                                Decode.succeed (CloseMenu which)
                    )
    in
    div [ class ("type-menu-wrap " ++ spec.wrapClass), on "focusout" leavesMenu ]
        [ button
            [ type_ "button"
            , id (prefix ++ "button")
            , class spec.buttonClass
            , classList [ ( "deviates", spec.deviates ), ( "no-ring", spec.noRing ) ]
            , on "pointerdown" (Decode.succeed (MenuPointer True))
            , on "blur" (Decode.succeed ClearNoRing)
            , attribute "aria-haspopup" "menu"
            , attribute "aria-controls" (prefix ++ "menu")
            , attribute "aria-expanded"
                (if spec.open then
                    "true"

                 else
                    "false"
                )
            , attribute "aria-label" spec.label
            , onClick (ToggleMenu which)
            , preventDefaultOn "mousedown" (Decode.succeed ( NoOp, True ))
            , menuButtonKeys which
            ]
            spec.buttonContent
        , if spec.open then
            let
                -- Choice rows scroll (more than 8); action rows (Manage categories…) stay fixed below.
                ( choices, actions ) =
                    List.indexedMap Tuple.pair spec.rows
                        |> List.partition (\( _, r ) -> r.selected /= Nothing)

                render =
                    List.concatMap (\( i, r ) -> item i r)
            in
            div
                [ classList
                    [ ( "type-menu", True )
                    , ( "menu-down", spec.down )
                    , ( "menu-status", which == StatusMenu )
                    ]
                , id (prefix ++ "menu")
                , attribute "role" "menu"
                ]
                (div [ class "menu-list", attribute "role" "none" ] (render choices) :: render actions)

          else
            text ""
        ]
