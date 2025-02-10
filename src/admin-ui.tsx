import { Color4 } from '@dcl/sdk/math'
import ReactEcs, {
  Button,
  Label,
  UiEntity,
  Input,
  Dropdown,
  ReactBasedUiSystem,
} from '@dcl/react-ecs'
import {
  Entity,
  IEngine,
  TextAlignMode,
  YGFlexDirection,
  YGPositionType,
  BackgroundTextureMode,
  YGUnit,
  InputAction,
  PointerEventsSystem,
  YGAlign,
  UiText,
} from '@dcl/ecs'
import {
  Action,
  AdminTools,
  AlignMode,
  getComponents,
  getPayload,
  IPlayersHelper,
} from './definitions'
import { getActionEvents } from './events'
import { getExplorerComponents } from './components'
import {
  getUIBackground,
  getUIText,
  getUITransform,
  mapAlignToScreenAlign,
} from './ui'

// Tab enum for type safety
enum TabType {
  NONE = 'None',
  VIDEO_CONTROL = 'VideoControl',
  SMART_ITEMS = 'SmartItemsControl',
  TEXT_ANNOUNCEMENT = 'TextAnnouncementControl',
  MODERATION = 'ModerationControl',
  AIRDROP = 'AirdropControl',
}

type SelectedSmartItem = { visible: boolean; selectedAction: string }

type State = {
  activeTab: TabType
  videoControl: {
    shareScreenUrl: string
    selectedVideoPlayer: Entity | undefined
  }
  smartItemActions: {
    selectedSmartItem: number | undefined
    smartItem: Map<Entity, SelectedSmartItem>
  }
  textAnnouncement: {
    entity: Entity | undefined
    text: string | undefined
    messageRateTracker: Map<string, number>
    announcements: {
      entity: Entity
      timestamp: number
    }[]
    maxAnnouncements: number
  }
  airdrop: {
    airdrop: Entity | undefined
  }
}

let state: State = {
  activeTab: TabType.NONE,
  videoControl: {
    shareScreenUrl: '',
    selectedVideoPlayer: undefined,
  },
  smartItemActions: {
    selectedSmartItem: undefined,
    smartItem: new Map<Entity, SelectedSmartItem>(),
  },
  textAnnouncement: {
    entity: undefined,
    text: undefined,
    messageRateTracker: new Map<string, number>(),
    announcements: [],
    maxAnnouncements: 4,
  },
  airdrop: {
    airdrop: undefined,
  },
}

const BTN_MODERATION_ACTIVE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMUAAACoCAYAAABQUip0AAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAsqSURBVHgB7d09c9NKG8bxtXHSnnwDfAb6hIEazNBD4AMQDvRwoOf1A3CAHkLoIUDP4NAzhB6G0DPzmDavz30ZyZiNbEuyZMvS/zfj2HFC7JC9dO9qpVXNFdTBwcHC7u7ukt0vHTly5KjdN2u1WtO+tKCv6d6hyDr29+rY32oreLy1t7f33e43G43Gpr7mCqrmCkIN3f7Tlu0/a9E+XVYIHEpL4bC/8aY93LCNXluhcQUx1VAoCDs7O1fq9foF+7TlUGVtu60VISBTCYUFoWW/+F1HEBCtbbc162Y9d1Mw0VDYGOGKheGGxgkOGEEVw9rK/UmHYyKhCMJwl3EC0ph0OHINhbpJNl74j8qALEwqHLmEItiT9J89vOKA7D23Afn9vAbkmYfCukrLdrfqmEdAvjTPcTOPqlF3GemrDuuOQCB/amOrthFeDSZzM5NJpdAAen9/f52xA6ZB3Sgbu57Nqjs1dqXY3t5eskC8JxCYFm2UrZfyKei6j22sUOhNWELfs6sVBaAu1LptpP91Y0odCgvCimP8gILRFIBVjbtuDKnGFAqEvfBzBxSUjS/uabetSyFxKIJ+27oDCs7Gujfn5+cfuYQShSIc0Di6TJgR1mbPzs3NtZP8m9hjimC363tHIDBDrBu1nnRHUOxKYRXiG3uZMIuCeYwTcc/2i1UpNJonEJhVQbd/Ne73jwyFDvu2H3rPAbNtOe4cxtDuUziOoEqgJDq2m/bEqMNBhlYKuk0omYU43aiBlULHNNng5JMDyudio9F4PeiLA0PB3iaU1ai9UZHdp2Bw3XRACaltWxsfOOiOrBRUCVSABt1/R1WLQ5WCKoGKWBhULQ5VCqoEKiSyWvxRKbQkDYFAhXTXL/af/CMUlpgVB1TLoTbf6z4Fx4d8c0DFBF2orfDzXqWwQLQcUEHaudT/eX/3ia4TKsmqxJk/PteHYCGz/zmgovq7UN1KQdcJVWd7Xnt7obqhsErRckCF1ev1xd5jfQiuMwdUWa9SdMcUNvo+cEDFheOKus6bcAA0tu5mwbpS9aYDoMXTmrqvs1o48Es42K5zACDQ09QHdZ+OOgDS1Ie6jbZZBhP4pZuFumNtWCDUCwWAPjUm7oDfGo1GjUoBeAgF4CEUgIdQAB5CAXgIBeBpOKTW6XTcz58/e58fPTqdI2a+f//ee/zXX3+5hQXmY8dBKBLa2Nhwb968cW/fvnVbW1uHvn7mzBl3+fJl12q1cguJwvjixYvu+/j8+XP3836Li4tuaWmp+z70fpAMk3cxaWt89erVbijiun79urtx40Zm4VDjf/LkSffmB2EQheLZs2dTq2KzRpN3hCIGNcIHDx7Eboj9ms2me/fu3diNUqE8d+5cZHWK486dO90bhiMUMSgMuo1DfXwFQ92aNBSIkydPpgplP4IxGqEYQRXi1q1bLgsKxsePHxNXjHErhO/hw4fdbh2iEYohsto691OlUDCSUCCSjGPi0HtIW7XKjgMCh0g7hhhGe4pUfeJaW1vLPBCSVfUrKypFBFWJY8eOuTyoG/Xjx49Y33v8+PHMuk0+jXHYXXsYlWKAx48fu7yo+sTZ+quq5BUI0RwHohGKCGqQeYrTIPPoNvXT5COiEYoIeTfI/sMypvUeVIWyHjOVBaHw5NllSfIak2iw/cdt4TdCMQU0xmIjFJ5JHGEaZwKPI12nh1B41BjzbpBxfv4kDuDjIMFohCJC3rO9ceYHivAeqopQRLhw4YLLU5yfX4T3UFWEIoJOzsmrC6UtdNwxRZ5bc0IxGKGIoAaZ15GkOko1j+9NQr8b44nBCMUAajg6QSjrn5lkrKDvzTqc+p10NiAG44DAIbI8fFwNXAfhpemWZXX4eNpzOqqEAwJHUONRQx63YigQr169Sj1Oefny5dh7o8Kz/wjEaIRihHALnzYY6v6M2xjDLXzaU0nDk5s4sSgeQhGDGvSXL1/c06dPY4dDe44UBg2Ws9qTpVB8/frVraysxPp+va5eny5TMowpUlD/XrdwzSWNPbQImdZa0tZYuzvzboR6zXa73T0EvP89KLR6bb0HJuiS4xxtwMNAG4hAKAAPoQA8hALwEArAQygAD6EAPFy0JYZwcmxzc7N7r5ueC5+XcLJOs8h6rHtN5GkyLY/DK/TaWtoznEDUYgj9VzEKJ/F0C98D533Hw+RdBDW0cMZa91ksexNeXej06dO9me9xKZCXLl2KvXhbGA7NdIf3+BMz2gFtabVq34cPH7r3k1hzSQ00vBTYOI1T7/XatWuplsEMz+47f/58rpcjmyWVD4WqQH8XZFqyCEgW51yE7yHuAYdlVMlQpLlu3CQpILdv307cMPW7nDp1KpOunt6DqkeW1+ubFZUKRdHD4EsTjjwuNKPD1fUeqhKOyoRC3Qr1uyexTmzWkl7dNMtLkoXSVq9ZVIlQqIEkuXpQEWlArC123EUM8rrYi14/rxVGiqL0h46rOsx6IETdIYU77lVa81qeR/+XWXfPiqi0laIMFSJKnKubqtGqWuTVeMNTbcuotJUiHFCXkcI+atdrOJuel3BXdlmVLhTaA1PWQITiNMi8l8XM4+qxRVG6UOhk/lncy5REuHDCMJPYhVrWjU/pQlGVCxyOOt5pEms85X1dvmkpXSiqcnHDIvyecS5oOYs4nwLwEArAQygAD6EAPIQC8BAKwEMoAA+hADyEAvAQCsBTuvMpwoXByq5/4bNBJnEYRtnO3WbdJ8DDlYyACIQC8BAKwEMoAA+hADyEAvDUa7XalgPQQ6UAPIQC+K27GkT94OBgywFw4VCivr+/X851SoCErED8qhQMtIGeLX0gFEDAKkW316Tu06YDoDFFNwv1ubm5LQfAHTly5FcoLB2dMCFAVWkY0dv7pA/WhSrn8tFATJaB3jLu4eTdawdUmFWJXga6oWg0Guo+VWMNeyCCjSfa4eNuKDSusDvGFagkjan7pyZ6xz5Zn+qNAypob29vrf/zWvjAJi4W7Ivf7OGCAyrEuk5/R1aKoAvVdkC1tP2jOv44dNyqxWMHVMua/0TNf2J3d/e93bUcUHKqEOo6+c9HnWS05oAKsJ7R/ajna1FPasBt/6DpgJJSlajX62ejjhKPPB11UIKAsrApiLVBp03UBv0jxhYoq0FjidDAhQuoFiirUW17YCjm5uba7KJFCb1uNBrPh31DbdgXNcttfa9PDLpREh3rNp0YdQr20HWfNMttofjHASVgbfl+nDUJRi6GRjcKJfF8fn7+UZxvrLmYbO5C3aglB8yYYXMSUWIvm2k/9CLL4WAGdZIEQmKHQj/UqsVFxxl6mC3/JN2YJ1pg2fpkOjuPgTdmgg2sb9ru18TrDyRedTx4EYKBQtMEXdyBtS/2QNu3u7t7xe5WHVAwCoTtNb3nUkodCrFgLLtfweAUVhSCukxpK0RorFDI9vb2ks0SrjPrjSnrWBu8qHk1N6axQyEKhCX0PcHANCSdhxglk8t7hYfiMvONSdN5ERaIE1nOoWV6zTsrXf+6FPuFgRQ6wfjhSrASTWYy6T751I3a2dm5ZwlecUD22tYzyW3jm0soQhaMlgVjlbEGsqAQ6KjtLAbTw+R6yWC9+eC0P7pUGIf2LN3X2CHvQEiulcKnCT8Lx10qB2JSGB43Go1HWY8bhploKELqVtkvecMeLjvgsHYwK912UzCVUIRUMfb29lr2UAPylkOVKQgbk64KUaYain7BquctG0gt2zhkkROayk1jTPsbt+3hhv29X087CP0KEwqfQmJjkCWFw/7DmnY7ak8v6LG+5jjequg6QUPXuEAB+K57XSBFV84qUgh8/wcRhmuTYD6aKgAAAABJRU5ErkJggg=='
const BTN_MODERATION =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMQAAACpCAYAAAB0zJLvAAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAYISURBVHgB7d1PUttmGMfx55FNwpIb1D1B3RPEOUGSTRtWQTMlna6AEwROAFl1Cp0RrEiyIZwg7glCbuDewEtIsN6+74tJHVtYsqyXgPz9zCSTZF57hKOfJb3/HhEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwK1SQWlJctySL40V0cGKmEZflpZ6cfysL7coSU5WRM5X5FJa/h+ay2e3fQx1QiBmlBwcd1T1hRh5av+6ktHkTCLtmih9HcerPQnAhSC6/LxhxLhjaE80UOnZ37vGmKN4fbUrKIxAFOSDIPrK/rFT+EUqh6ZhdqoKhguCXn62x2A2C7/IhsMew+NQ4awbAlHA0cHbV/bbeFvKcCdkGj2LX/5yJnNI9t+1VdIT+34tKcGGefvF+q87gqkIRI65wvC/vjHR47KhSP5++1SNSST7Fq0wQpGPQExRURiu9U3T/DzrrUvy53FLm/pR5gzDNZPKVvz78z1BpkiQyZ2IFYbBsff/msz4GtGGfpCKwuDfL5Jdd/slyEQgbmC/lWc+eQvoJPvHa0Ub+7YlnxmmUU13BZkIRAbXoySz9CbNwHbZbhRue9WrFUJn+DNiDIHI4McZwmkXORl9mwBXh69UnwomEIhsge+xNf/9A5+wauSRYAKBGOOnQpiwgVCVn3LbmPw2c+LBOgOBGHd+XlmPzhSt3BYqwY/Dz8XCNwjEXZXKbQQTYwjEXXU1QS+wZWbFjiEQY+I//Ehy0BPFiHzKb2P+lbD6TBOfRCCyzTURL1dqCry/hj0GDfwz3lMEIoP9Bj+VkJakm9um+fBQAjKpORJMIBBZrk7GMLcTKodFJvgNb2e6EoJ7Pllafi+YQCAyuJPR3sO/lgDcgqHCbcUEmartV9Lx/JCJQNykubxnz8ieVMid4LNM/3bLP41KtcG0Vwf7vtuCTATiBv4qMTCPKwuF0fdlTsT4t+duuWhXqjBcTiq4EYGYwnXBVhIKGwaz9CCWkkzz4TOZNxSsrS6EFXMFDFetufURHZmR7bHaiterWaGWHBxvl5oSrtK1YYgJQz4CMQO3YEcj3Sg0+U/tVaGRblV9ErpwSlNcMPKnqKvfimaHrWiKIxAl+CWYmrr9mR7Za8BwzpH2/eiyG3SzXZqhe3F8MBr2ihVp2/4njs6M7RljR8JN1J13pw8AAAAAAAAAAABUh4G5AvzuFIOoLca07Ej1DzKQlqhx29W0vmmofg1FX4wdpNP0kxusswN3ZyGq+vhaEYOLXUkzppO49Q72GOzAXc+kbimqPQbT6DNQl49AjPH7Ml2etzWKnthRZzdFw/2afwcMd5KmembU/FPVKPJwjtWJFN9jyYXSVTg6M2l6SvmtSQRCrkNwsWY/jCcSaE/XCddlr0RPpfGgW/bEHAZ4r9Dcpmy+9JZb1srkvwUOxHcJwTSu/NYcNeEOD964bfM7Mp9hOMLPxbqrFi4QIwUL3cKbu7cZmC/BZXbil6uHs7zMP1N8ufhYyQbJ11evCuvj3RcLE4g7H4RxJYJRdbWh4XEcLlIwFiIQR/vvNmyvz7bchyCMm3GlW+lFRHnHUOKqdR/VOhBfuyaNrMk9V7Q2XKW3ThN0zzQf7NT5+aK2a6qvajpffKhDGBxXG84Vgcxr5zdH0FCbkJlN95n6Domaqm0gfBhqVgPBFYFM/nqzmdvQbaETbn/atv1sT6SmahmI4TdpLQuC+CqiOSW5hrc0IUelXY26bamh2gUiQDndO6fIQ3Po/WntMWzU8dapfleI5kIUE+zkVv9R7UlYboQ8//btnqldIIYjz/WX5oxKp8ED4TZgq91taf2uELogpajSnG7VwSB416h9ngldGPLW1S8Q1GbDHNjbFRhBIIARBAIYQSCAEQQCGEEggBEEAhhBIIARBAIY0ZSaMUuLUmVzeerUDFcwMkmOfxQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAr/gMt3zlloPkVzgAAAABJRU5ErkJggg=='

const BTN_AIRDROP_ACTIVE =
  'data:image/png;base64,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'
const BTN_AIRDROP =
  'data:image/png;base64,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'

export function createAdminToolkitUI(
  engine: IEngine,
  pointerEventsSystem: PointerEventsSystem,
  reactBasedUiSystem: ReactBasedUiSystem,
  playersHelper?: IPlayersHelper,
) {
  console.log('setupUi')

  reactBasedUiSystem.setUiRenderer(() =>
    uiComponent(engine, pointerEventsSystem, playersHelper),
  )
}

const uiComponent = (
  engine: IEngine,
  pointerEventsSystem: PointerEventsSystem,
  playersHelper?: IPlayersHelper,
) => {
  const containerBackgroundColor = Color4.create(0, 0, 0, 0.75)

  return (
    <UiEntity
      uiTransform={{
        width: 500,
        flex: 1,
        alignSelf: 'center',
        margin: '16px 0 8px 470px',
        padding: 4,
        pointerFilter: 'block',
        flexDirection: 'column',
        positionType: 'absolute',
        position: { top: 40, right: 10 },
      }}
    >
      <UiEntity
        uiTransform={{
          width: '100%',
          height: 50,
          flexDirection: 'row',
          alignItems: 'center',
        }}
        uiBackground={{ color: containerBackgroundColor }}
      >
        <Label
          value="Admin Tools"
          fontSize={20}
          color={Color4.create(160, 155, 168, 1)}
          uiTransform={{ margin: '0 20px 0 24px' }}
        />
        <Button
          value=""
          fontSize={25}
          uiTransform={{
            width: 49,
            height: 42,
            margin: '0 8px 0 0',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          uiBackground={{
            color: Color4.White(),
            textureMode: 'stretch',
            texture: {
              src:
                state.activeTab === TabType.MODERATION
                  ? BTN_MODERATION_ACTIVE
                  : BTN_MODERATION,
            },
          }}
          onMouseDown={() => {
            state.activeTab = TabType.MODERATION
          }}
        />
        <Button
          value=""
          fontSize={25}
          uiTransform={{
            width: 49,
            height: 42,
            margin: '0 8px 0 0',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          uiBackground={{
            color: Color4.White(),
            textureSlices: {
              top: 100,
              right: 100,
              bottom: 100,
              left: 100,
            },
            texture: {
              src: 'assets/asset-packs/admin_toolkit/ui/icons/video_controls.png',
            },
          }}
          onMouseDown={() => {
            state.activeTab = TabType.VIDEO_CONTROL
          }}
        />
        <Button
          value=""
          fontSize={25}
          uiTransform={{
            width: 49,
            height: 42,
            margin: '0 8px 0 0',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          uiBackground={{
            color: Color4.White(),
            textureSlices: {
              top: 100,
              right: 100,
              bottom: 100,
              left: 100,
            },
            texture: {
              src: 'assets/asset-packs/admin_toolkit/ui/icons/smart_items.png',
            },
          }}
          onMouseDown={() => {
            state.activeTab = TabType.SMART_ITEMS
          }}
        />
        <Button
          value=""
          fontSize={25}
          uiTransform={{
            width: 49,
            height: 42,
            margin: '0 8px 0 0',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          uiBackground={{
            color: Color4.White(),
            textureSlices: {
              top: 100,
              right: 100,
              bottom: 100,
              left: 100,
            },
            texture: {
              src: 'assets/asset-packs/admin_toolkit/ui/icons/text_announcements.png',
            },
          }}
          onMouseDown={() => {
            state.activeTab = TabType.TEXT_ANNOUNCEMENT
          }}
        />
        <Button
          value=""
          fontSize={25}
          uiTransform={{
            width: 49,
            height: 42,
            margin: '0 8px 0 0',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          uiBackground={{
            color: Color4.White(),
            textureMode: 'stretch',
            texture: {
              src:
                state.activeTab === TabType.AIRDROP
                  ? BTN_AIRDROP_ACTIVE
                  : BTN_AIRDROP,
            },
          }}
          onMouseDown={() => {
            state.activeTab = TabType.AIRDROP
          }}
        />
      </UiEntity>
      {state.activeTab !== TabType.NONE ? (
        <UiEntity
          uiTransform={{ width: '100%', height: 500, margin: '10px 0 0 0' }}
          uiBackground={{ color: containerBackgroundColor }}
        >
          {state.activeTab === TabType.MODERATION && renderModeration(engine)}
          {state.activeTab === TabType.VIDEO_CONTROL &&
            renderVideoControl(engine)}
          {state.activeTab === TabType.SMART_ITEMS && renderSmartItems(engine)}
          {state.activeTab === TabType.TEXT_ANNOUNCEMENT &&
            renderTextAnnouncement(engine, pointerEventsSystem, playersHelper)}
          {state.activeTab === TabType.AIRDROP && renderAirdrop(engine)}
        </UiEntity>
      ) : null}
    </UiEntity>
  )
}

function getVideoPlayers(engine: IEngine) {
  const { AdminTools } = getComponents(engine)
  const { VideoPlayer } = getExplorerComponents(engine)

  const adminToolkitEntities = Array.from(engine.getEntitiesWith(AdminTools))
  const adminToolkit =
    adminToolkitEntities.length > 0 ? adminToolkitEntities[0][1] : null

  if (
    !adminToolkit ||
    !adminToolkit.videoControl.videoPlayers ||
    adminToolkit.videoControl.videoPlayers.length === 0
  )
    return []

  let videoPlayers = []

  if (adminToolkit.videoControl.linkAllVideoPlayers) {
    videoPlayers = Array.from(engine.getEntitiesWith(VideoPlayer)).map(
      (videoPlayer) => videoPlayer[0],
    )
  } else {
    videoPlayers = adminToolkit.videoControl.videoPlayers.map(
      (videoPlayer) => videoPlayer.entity,
    )
  }
  return videoPlayers
}

function renderVideoControl(engine: IEngine) {
  const videoPlayers = getVideoPlayers(engine)

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <Label
        value="Video Control"
        fontSize={24}
        color={Color4.White()}
        uiTransform={{ width: '100%', height: 30, margin: '0 0 10px 0' }}
      />

      <Label
        value="Current Screen"
        fontSize={18}
        color={Color4.White()}
        uiTransform={{ width: '100%', height: 25, margin: '0 0 10px 0' }}
      />

      {videoPlayers.length > 0
        ? videoPlayers.map((videoPlayer, idx) => (
            <Button key={videoPlayer} value={`#${idx + 1}`} />
          ))
        : null}

      <Input
        onSubmit={(value) => {
          state.videoControl.shareScreenUrl = value
        }}
        value={state.videoControl.shareScreenUrl}
        onChange={($) => (state.videoControl.shareScreenUrl = $)}
        fontSize={35}
        placeholder={'Screen URL something'}
        placeholderColor={Color4.White()}
        color={Color4.White()}
        uiTransform={{
          width: '100%',
          height: '80px',
        }}
      ></Input>

      <UiEntity
        uiTransform={{
          width: '100%',
          height: 40,
          flexDirection: 'row',
          margin: '0 0 10px 0',
        }}
      >
        <Button
          value="Clear"
          variant="primary"
          fontSize={16}
          uiTransform={{ width: '49%', height: 40, margin: '0 2% 0 0' }}
          onMouseDown={() => {
            console.log('Clear clicked 4')
            state.videoControl.shareScreenUrl = ''
          }}
        />
        <Button
          value="Share"
          variant="primary"
          fontSize={16}
          uiTransform={{ width: '49%', height: 40 }}
          onMouseDown={() => {
            console.log('Share clicked')
            shareScreen(engine, state.videoControl.shareScreenUrl)
          }}
        />
      </UiEntity>

      <Label
        value="Video Playback"
        fontSize={18}
        color={Color4.White()}
        uiTransform={{ width: '100%', height: 25, margin: '0 0 10px 0' }}
      />

      <UiEntity
        uiTransform={{
          width: '100%',
          height: 80,
          flexDirection: 'row',
          flexWrap: 'wrap',
          margin: '0 0 10px 0',
        }}
      >
        <Button
          value="Previous"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => {
            handlePreviosTrack(engine)
          }}
          disabled={true}
        />
        <Button
          value="Play"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => {
            handlePlay(engine)
          }}
        />
        <Button
          value="Pause"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => {
            handlePause(engine)
          }}
        />
        <Button
          value="Restart"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => {
            handleRestart(engine)
          }}
        />
        <Button
          value="Next"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => {
            handleNextTrack(engine)
          }}
          disabled={true}
        />
      </UiEntity>

      <Label
        value="Video Volume"
        fontSize={18}
        color={Color4.White()}
        uiTransform={{ width: '100%', height: 25, margin: '0 0 10px 0' }}
      />

      <UiEntity
        uiTransform={{
          width: '100%',
          height: 40,
          flexDirection: 'row',
        }}
      >
        <Button
          value="Minus"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => handleMinus(engine)}
        />
        <Button
          value="Plus"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => handlePlus(engine)}
        />
        <Button
          value="Mute"
          variant="secondary"
          fontSize={14}
          uiTransform={{
            width: '32%',
            height: 35,
          }}
          onMouseDown={() => handleMute(engine)}
        />
      </UiEntity>
    </UiEntity>
  )
}

function shareScreen(engine: IEngine, screenUrl: string) {
  console.log('Share clicked', screenUrl)
  const { AdminTools } = getComponents(engine)
  const adminToolkitEntities = Array.from(engine.getEntitiesWith(AdminTools))
  const adminToolkit = adminToolkitEntities[0][1]
  if (
    !adminToolkit.videoControl.videoPlayers ||
    adminToolkit.videoControl.videoPlayers.length === 0
  )
    return
  const { VideoPlayer } = getExplorerComponents(engine)

  console.log(
    'all screens linked?',
    adminToolkit.videoControl.linkAllVideoPlayers,
  )

  let videoPlayers = getVideoPlayers(engine)

  for (const videoPlayer of videoPlayers) {
    const videoSource = VideoPlayer.getMutableOrNull(videoPlayer as Entity)
    if (videoSource) {
      videoSource.src = screenUrl
    }
  }
}

function handlePlay(engine: IEngine) {
  console.log('Play clicked')
  const { VideoPlayer } = getExplorerComponents(engine)
  let videoPlayers = getVideoPlayers(engine)

  for (const videoPlayer of videoPlayers) {
    const videoSource = VideoPlayer.getMutableOrNull(videoPlayer as Entity)
    if (videoSource) {
      videoSource.playing = true
    }
  }
}

function handlePause(engine: IEngine) {
  console.log('Pause clicked')
  const { VideoPlayer } = getExplorerComponents(engine)

  let videoPlayers = getVideoPlayers(engine)

  console.log('videoPlayers', videoPlayers)

  for (const videoPlayer of videoPlayers) {
    console.log('videoPlayer', videoPlayer)
    const videoSource = VideoPlayer.getMutableOrNull(videoPlayer as Entity)
    if (videoSource) {
      videoSource.playing = false
    }
  }
}

function handleRestart(engine: IEngine) {
  console.log('Restart clicked')
  const { VideoPlayer } = getExplorerComponents(engine)
  let videoPlayers = getVideoPlayers(engine)

  for (const videoPlayer of videoPlayers) {
    const videoSource = VideoPlayer.getMutableOrNull(videoPlayer as Entity)
    if (videoSource) {
      videoSource.position = 0
    }
  }
}

// TODO: Previous track in playlist
function handlePreviosTrack(engine: IEngine) {
  console.log('Previous Track clicked')
}

// TODO: Next track in playlist
function handleNextTrack(engine: IEngine) {
  console.log('Next Track clicked')
}

function handleMinus(engine: IEngine) {
  console.log('Minus clicked')
  const { VideoPlayer } = getExplorerComponents(engine)
  let videoPlayers = getVideoPlayers(engine)

  for (const videoPlayer of videoPlayers) {
    const videoSource = VideoPlayer.getMutableOrNull(videoPlayer as Entity)
    if (videoSource) {
      videoSource.volume = videoSource.volume ? videoSource.volume - 0.1 : 0
    }
  }
}

function handlePlus(engine: IEngine) {
  console.log('Plus clicked')
  const { VideoPlayer } = getExplorerComponents(engine)
  let videoPlayers = getVideoPlayers(engine)

  for (const videoPlayer of videoPlayers) {
    const videoSource = VideoPlayer.getMutableOrNull(videoPlayer as Entity)
    if (videoSource) {
      videoSource.volume = videoSource.volume ? videoSource.volume + 0.1 : 0
    }
  }
}

function handleMute(engine: IEngine) {
  console.log('Mute clicked')
  const { VideoPlayer } = getExplorerComponents(engine)
  let videoPlayers = getVideoPlayers(engine)

  for (const videoPlayer of videoPlayers) {
    const videoSource = VideoPlayer.getMutableOrNull(videoPlayer as Entity)
    if (videoSource) {
      videoSource.volume = 0
    }
  }
}

function getSmartItems(
  engine: IEngine,
): NonNullable<AdminTools['smartItemActions']['smartItems']> {
  const { AdminTools } = getComponents(engine)

  const adminToolkitEntities = Array.from(engine.getEntitiesWith(AdminTools))
  const adminToolkit =
    adminToolkitEntities.length > 0 ? adminToolkitEntities[0][1] : null

  if (
    !adminToolkit ||
    !adminToolkit.smartItemActions ||
    !adminToolkit.smartItemActions.smartItems ||
    adminToolkit.smartItemActions.smartItems.length === 0
  )
    return []

  return Array.from(adminToolkit.smartItemActions.smartItems)
}

function getSmartItemActions(
  engine: IEngine,
  smartItem: NonNullable<AdminTools['smartItemActions']['smartItems']>[0],
) {
  const { Actions } = getComponents(engine)
  if (!smartItem || !Actions.has(smartItem.entity as Entity)) return []

  const actions = Array.from(Actions.get(smartItem.entity as Entity).value)
  return actions
}

function renderSmartItems(engine: IEngine) {
  const smartItems = getSmartItems(engine)
  const actions =
    state.smartItemActions.selectedSmartItem !== undefined
      ? getSmartItemActions(
          engine,
          smartItems[state.smartItemActions.selectedSmartItem],
        )
      : []

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <Label
        value="Smart Item Actions"
        fontSize={24}
        color={Color4.White()}
        uiTransform={{ width: '100%', height: 30, margin: '0 0 10px 0' }}
      />

      <Label
        value="Selected Smart Item"
        fontSize={18}
        color={Color4.White()}
        uiTransform={{ width: '100%', height: 25, margin: '0 0 10px 0' }}
      />

      <Dropdown
        options={[
          'Select Smart Item',
          ...smartItems.map((item) => item.customName),
        ]}
        selectedIndex={(state.smartItemActions.selectedSmartItem ?? -1) + 1}
        onChange={(idx) => handleSelectSmartItem(smartItems, idx)}
        uiTransform={{
          width: '100%',
          height: '40px',
        }}
        color={Color4.White()}
      />

      <Label
        value="Actions"
        fontSize={18}
        color={Color4.White()}
        uiTransform={{ width: '100%', height: 25, margin: '0 0 10px 0' }}
      />
      <Dropdown
        options={actions.map((action) => action.name)}
        disabled={state.smartItemActions.selectedSmartItem === undefined}
        onChange={(idx) => {
          handleSelectAction(
            smartItems[state.smartItemActions.selectedSmartItem!],
            actions[idx],
          )
        }}
        selectedIndex={actions.findIndex(
          (action) =>
            (state.smartItemActions.selectedSmartItem !== undefined &&
              action.name ===
                state.smartItemActions.smartItem.get(
                  smartItems[state.smartItemActions.selectedSmartItem]
                    .entity as Entity,
                )?.selectedAction) ||
            action.name ===
              smartItems[state.smartItemActions.selectedSmartItem!]
                .defaultAction,
        )}
        uiTransform={{
          width: '100%',
          height: '40px',
        }}
        color={Color4.White()}
      />

      <UiEntity uiTransform={{ flexDirection: 'row', margin: '10px 0 0 0' }}>
        <Button
          value={`${
            state.smartItemActions.selectedSmartItem !== undefined &&
            state.smartItemActions.smartItem.get(
              smartItems[state.smartItemActions.selectedSmartItem]
                .entity as Entity,
            )?.visible
              ? 'Hide'
              : 'Show'
          } Entity`}
          onMouseDown={() => handleHideShowEntity(engine, smartItems)}
          disabled={state.smartItemActions.selectedSmartItem === undefined}
          uiTransform={{ margin: '0 8px 0 0' }}
        />
        <Button
          value="Restart Action"
          onMouseDown={() =>
            handleRestartAction(
              smartItems[state.smartItemActions.selectedSmartItem!],
              actions.find(
                (action) =>
                  action.name ===
                  state.smartItemActions.smartItem.get(
                    smartItems[state.smartItemActions.selectedSmartItem!]
                      .entity as Entity,
                  )?.selectedAction,
              )!,
            )
          }
          uiTransform={{ margin: '0 8px 0 0' }}
        />
        <Button
          value="Default"
          onMouseDown={() =>
            handleResetToDefaultAction(
              smartItems[state.smartItemActions.selectedSmartItem!],
              actions.find(
                (action) =>
                  action.name ===
                  smartItems[state.smartItemActions.selectedSmartItem!]
                    .defaultAction,
              )!,
            )
          }
        />
      </UiEntity>
    </UiEntity>
  )
}

function handleSelectSmartItem(
  smartItems: NonNullable<AdminTools['smartItemActions']['smartItems']>,
  idx: number,
) {
  if (idx === 0) return

  const selectedSmartItemIdx = idx - 1

  let smartItemActions = {
    ...state.smartItemActions,
    selectedSmartItem: selectedSmartItemIdx,
  }

  const smartItem = smartItems[selectedSmartItemIdx]

  if (!state.smartItemActions.smartItem.has(smartItem.entity as Entity)) {
    const stateSmartItems = new Map(state.smartItemActions.smartItem)
    stateSmartItems.set(smartItem.entity as Entity, {
      visible: true,
      selectedAction: smartItem.defaultAction,
    })
    smartItemActions = {
      ...smartItemActions,
      smartItem: stateSmartItems,
    }
  }

  state = {
    ...state,
    smartItemActions,
  }
}

function handleExecuteAction(
  smartItem: NonNullable<AdminTools['smartItemActions']['smartItems']>[0],
  action: Action,
) {
  const actionEvents = getActionEvents(smartItem.entity as Entity)
  actionEvents.emit(action.name, getPayload(action))
}

function handleSelectAction(
  smartItem: NonNullable<AdminTools['smartItemActions']['smartItems']>[0],
  action: Action,
) {
  console.log('Action selected', action, smartItem)

  const stateSmartItems = new Map(state.smartItemActions.smartItem)
  stateSmartItems.set(smartItem.entity as Entity, {
    ...stateSmartItems.get(smartItem.entity as Entity)!,
    selectedAction: action.name,
  })

  state = {
    ...state,
    smartItemActions: {
      ...state.smartItemActions,
      smartItem: stateSmartItems,
    },
  }

  handleExecuteAction(smartItem, action)
}

function handleHideShowEntity(
  engine: IEngine,
  smartItems: NonNullable<AdminTools['smartItemActions']['smartItems']>,
) {
  console.log('Hide/Show entity clicked')

  const { VisibilityComponent } = getExplorerComponents(engine)

  const smartItemEntity = smartItems[state.smartItemActions.selectedSmartItem!]
    .entity as Entity
  const smartItem = state.smartItemActions.smartItem.get(smartItemEntity)

  const toggleVisibility = !smartItem!.visible
  state.smartItemActions.smartItem.get(smartItemEntity)!.visible =
    toggleVisibility

  const visibility = VisibilityComponent.getOrCreateMutable(smartItemEntity)
  visibility.visible = toggleVisibility
}

function handleRestartAction(
  smartItem: NonNullable<AdminTools['smartItemActions']['smartItems']>[0],
  action: Action,
) {
  console.log('Restart Action clicked', action)

  handleExecuteAction(smartItem, action)
}

function handleResetToDefaultAction(
  smartItem: NonNullable<AdminTools['smartItemActions']['smartItems']>[0],
  action: Action,
) {
  console.log('Reset to default action', action, smartItem)

  const stateSmartItems = new Map(state.smartItemActions.smartItem)
  stateSmartItems.set(smartItem.entity as Entity, {
    ...stateSmartItems.get(smartItem.entity as Entity)!,
    selectedAction: action.name,
  })

  state = {
    ...state,
    smartItemActions: {
      ...state.smartItemActions,
      smartItem: stateSmartItems,
    },
  }

  handleExecuteAction(smartItem, action)
}

function renderTextAnnouncement(
  engine: IEngine,
  pointerEventsSystem: PointerEventsSystem,
  playersHelper?: IPlayersHelper,
) {
  if (state.textAnnouncement.entity === undefined) {
    initTextAnnouncementUiStack(engine)
  }

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <Label
        value="Text Announcement"
        fontSize={24}
        color={Color4.White()}
        uiTransform={{ width: '100%', height: 30, margin: '0 0 10px 0' }}
      />
      <Input
        onSubmit={(value) => {
          state.textAnnouncement.text = value
        }}
        value={state.textAnnouncement.text}
        onChange={($) => (state.textAnnouncement.text = $)}
        fontSize={35}
        placeholder={'Write your announcement here'}
        placeholderColor={Color4.White()}
        color={Color4.White()}
        uiTransform={{
          width: '400px',
          height: '80px',
        }}
      ></Input>

      <UiEntity
        uiTransform={{
          width: '100%',
          height: 40,
          flexDirection: 'row',
          margin: '0 0 10px 0',
        }}
      >
        <Button
          value="Clear"
          variant="primary"
          fontSize={16}
          uiTransform={{ width: '49%', height: 40, margin: '0 2% 0 0' }}
          onMouseDown={() => {
            handleClearTextAnnouncement(engine)
          }}
        />
        <Button
          value="Share"
          variant="primary"
          fontSize={16}
          uiTransform={{ width: '49%', height: 40 }}
          onMouseDown={() => {
            handleSendTextAnnouncement(
              engine,
              pointerEventsSystem,
              state.textAnnouncement.text,
              playersHelper,
            )
          }}
        />
      </UiEntity>
    </UiEntity>
  )
}

function initTextAnnouncementUiStack(engine: IEngine) {
  const { UiTransform } = getExplorerComponents(engine)

  const uiStack = engine.addEntity()
  state.textAnnouncement.entity = uiStack

  // Get a UI Stack entity with center alignment
  const screenAlign = mapAlignToScreenAlign(
    AlignMode.TAM_BOTTOM_CENTER,
    YGFlexDirection.YGFD_COLUMN,
  )

  // Configure UI stack transform
  const uiStackTransformComponent = getUITransform(UiTransform, uiStack)
  uiStackTransformComponent.alignItems = screenAlign.alignItems
  uiStackTransformComponent.justifyContent = screenAlign.justifyContent
  uiStackTransformComponent.positionType = YGPositionType.YGPT_ABSOLUTE
  uiStackTransformComponent.flexDirection = YGFlexDirection.YGFD_COLUMN

  console.log('Init Text Announcement UI Stack', uiStackTransformComponent)
}

function removeUiTransformEntities(engine: IEngine, parentEntity: Entity) {
  const { UiTransform } = getExplorerComponents(engine)
  const entitiesWithUiTransform = engine.getEntitiesWith(UiTransform)

  for (const [uiEntity, uiTransform] of entitiesWithUiTransform) {
    if (uiTransform.parent === parentEntity) {
      removeUiTransformEntities(engine, uiEntity) // Recursively remove children
      console.log('Removing entity', uiEntity)
      engine.removeEntity(uiEntity)
    }
  }
}

function handleClearTextAnnouncement(engine: IEngine) {
  const textAnnouncementEntity = state.textAnnouncement.entity

  if (!textAnnouncementEntity) {
    return
  }

  removeUiTransformEntities(engine, textAnnouncementEntity)
  state.textAnnouncement.text = ''
  state.textAnnouncement.announcements = []
}

const BTN_CLOSE_TEXT_ANNOUNCEMENT =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAxCAYAAABznEEcAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAQRSURBVHgB7VlPU9NAFH+bpgye7DcwfgKYccDqKH/GD4Dc9GS5OYWZpuhJKwSpXnTaoJUr+AmEm56sXOzIpUdvlm9Qbw60Wd+mhZZmk91NUnrpb0YHkrfJ/ni77/fLW4AxxhijHwRihGlaqeTpqdEGmAZNM4CQ6+BACgg96b6srjlO493u2zrEiMgk2MS1s3aGAl3Cx00D0JR4FGngi6saoZ/fV4pViIjQJNzJn7ZylBBTbuK+U2gQClul3e19CIlQJPLZjRwuESva5D1TadBkYtG2rQYoQomE+dQySKK1hz8uwJCAWbFKu8UtlTEJ2cAOgfZ3YJt2mCCwcHdmDn4eH/2QHSJFokeAGnAVYERm5w0kcigTLiRx5QR6mJbNiCYKGBEBF5SAlV/deCKKCyRhZguboyLQg2NjOTeCInxJuMsI/xIgBGngf6EUmBByIBHG9KgcFOBLQku0N0E8Dbe206S+CIpEKCUrpcr2Mi4ZYTnFmIfP1woLfve5JFgW0EZkIBA9ccJ/TRUijIDdVWi7UrRkiDgO5Pzu8TOhtzIgAKrkQb+6yhLpJ3CBlo6/k2bgOCy7zOrw7mk+E1wCATBT5rq78XsQEeER6CvhIguDRvMsw7vhIcEeijOUUmVWAmWJCAgYIAVtint18EJCbynZChki8RBg2ed7No0TqOyNgojgveU4CHTfZPD2hZcEBQNCwI8IVp9LWhDZxuCX4+Al3sa+ASHBI9KPOHyYrmniTEQFI2JmX3CXpKa3y8OwMR4SaAWaEAGdTcxvBDh6YgVCWpQgcPYE/QshwRWyPqgqOw8tx/H8kTmZgAaEgF8ZfZYtXLILkYlMTDQGL3lJhHh4kA44BGxVZQ9AnY0dvOgh0db1KihARshUlD0IBAg31kOiy7QKElBR4jiIOIRyv7m5JZYCEX6gE6JtqSpxMBFhVfQI5zn4OpFM7AutMXVy/XogK2Q8IuhOyyIXi0vJ9yuQ2+2o1ar/0rfnrpHgJtkkasqj9My9b+lbDyaVlLivt7S++nIPM58RDcFsLeO8mvzH+YAZLXLW/iPh85udrIVSYrYXxIaTwE65UjT9bvvaDnetgvizEZGKYCUkHDN+Buu6FRQR2DyrHR/V7szev9lp2Y8GlOqL9sfgJrPQANJkkqUxdr8jA3QPWAEt4buluuKjaGUyAiXshEjFgiS6bf0vMOyuOLhNiLz96Y0tG698yJJfK9j4lhwMBbiJCV2xFY/ApM8nzlH7dfQ1PTN/ghrBMiIqv/LAMopa8Nj+8Po3KCLSwaOZfZXBtRup6YzjDxyAHTvCAWQsR8Am9knxmCqDT5sS96xQGAmto3k8ZPaGZ61VEes5NoPbUmm5vasUnllfLDdH05qg6/UwB4tjjDGGGv4DI3MOHJgAfIoAAAAASUVORK5CYII='
const CHAT_MESSAGE_ICON =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMEAAADBCAYAAAB2QtScAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAB7LSURBVHja7V1djJxndX7OO7ObYCd4ArvhT3gn/KgxhXohoJaq4I3UNhX9iU1vgkqLueA6QeoNtFXsG7jEuYpUWtmRWhqkQozU0htUrwlSoSXJuiBsRKlnTdUA3sQTqNfWzsx7evG9P+e83zfrXXs32dmcR1rv+pv5vpn55jzv+T8vYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMGw5/h/83OUXzCo5CgAAAABJRU5ErkJggg=='

function handleSendTextAnnouncement(
  engine: IEngine,
  pointerEventsSystem: PointerEventsSystem,
  text: string | undefined,
  playersHelper?: IPlayersHelper,
) {
  if (!text) {
    return
  }

  const { UiText, UiTransform, UiBackground } = getExplorerComponents(engine)
  const { AdminTools } = getComponents(engine)
  const adminToolkitEntities = Array.from(engine.getEntitiesWith(AdminTools))
  const adminToolkit =
    adminToolkitEntities.length > 0 ? adminToolkitEntities[0][1] : null

  if (
    state.textAnnouncement.announcements.length >=
    state.textAnnouncement.maxAnnouncements
  ) {
    const announcement = state.textAnnouncement.announcements[0]
    removeUiTransformEntities(engine, announcement.entity)
    engine.removeEntity(announcement.entity)
    state.textAnnouncement.announcements =
      state.textAnnouncement.announcements.slice(1)
  }

  const uiStack = state.textAnnouncement.entity!

  // Create container for the announcement
  const containerEntity = engine.addEntity()

  // Add to announcements array
  state.textAnnouncement.announcements.push({
    entity: containerEntity,
    timestamp: Date.now(),
  })

  const containerTransform = getUITransform(
    UiTransform,
    containerEntity,
    150,
    400,
    YGUnit.YGU_POINT,
  )
  containerTransform.parent = uiStack
  containerTransform.flexDirection = YGFlexDirection.YGFD_COLUMN
  containerTransform.marginBottom = 10
  containerTransform.marginBottomUnit = YGUnit.YGU_POINT
  containerTransform.paddingTop = 10
  containerTransform.paddingTopUnit = YGUnit.YGU_POINT
  containerTransform.paddingBottom = 10
  containerTransform.paddingBottomUnit = YGUnit.YGU_POINT
  containerTransform.paddingLeft = 10
  containerTransform.paddingLeftUnit = YGUnit.YGU_POINT
  containerTransform.paddingRight = 10
  containerTransform.paddingRightUnit = YGUnit.YGU_POINT

  // Add dark background with rounded corners
  UiBackground.createOrReplace(containerEntity, {
    color: {
      r: 0.15,
      g: 0.15,
      b: 0.15,
      a: 0.95,
    },
    textureMode: BackgroundTextureMode.NINE_SLICES,
    uvs: [0, 0, 1, 0, 1, 1, 0, 1],
  })

  // Create image entity
  const imageEntity = engine.addEntity()
  const imageTransform = getUITransform(
    UiTransform,
    imageEntity,
    60,
    50,
    YGUnit.YGU_POINT,
  )
  imageTransform.parent = containerEntity
  imageTransform.alignSelf = YGAlign.YGA_CENTER
  imageTransform.positionTop = 20
  imageTransform.positionTopUnit = YGUnit.YGU_POINT

  // Add image background
  getUIBackground(
    UiBackground,
    imageEntity,
    CHAT_MESSAGE_ICON,
    BackgroundTextureMode.STRETCH,
  )

  // Create text entity
  const textEntity = engine.addEntity()
  const textTransform = getUITransform(
    UiTransform,
    textEntity,
    200,
    380,
    YGUnit.YGU_POINT,
  )
  textTransform.parent = containerEntity

  // Add the text component
  getUIText(
    UiText,
    textEntity,
    text,
    18,
    380,
    TextAlignMode.TAM_MIDDLE_CENTER,
    Color4.White(),
  )

  // Add author text if enabled
  if (adminToolkit?.textAnnouncement.showAuthorOnEachAnnouncement) {
    const player = playersHelper?.getPlayer()
    const authorEntity = engine.addEntity()
    const authorTransform = getUITransform(UiTransform, authorEntity)
    authorTransform.parent = containerEntity
    authorTransform.positionType = YGPositionType.YGPT_ABSOLUTE
    authorTransform.positionRight = 5
    authorTransform.positionRightUnit = YGUnit.YGU_POINT
    authorTransform.positionBottom = 5
    authorTransform.positionBottomUnit = YGUnit.YGU_POINT

    // Add the author text component
    getUIText(
      UiText,
      authorEntity,
      `- ${!player || player?.isGuest ? 'Guest' : player?.name}`,
      14,
      380,
      TextAlignMode.TAM_BOTTOM_RIGHT,
      { r: 0.7, g: 0.7, b: 0.7, a: 1 },
    )
  }

  // Create close button entity
  const closeButtonEntity = engine.addEntity()
  const closeButtonTransform = getUITransform(
    UiTransform,
    closeButtonEntity,
    24,
    24,
    YGUnit.YGU_POINT,
  )
  closeButtonTransform.parent = containerEntity
  closeButtonTransform.positionType = YGPositionType.YGPT_ABSOLUTE
  closeButtonTransform.positionRight = 5
  closeButtonTransform.positionRightUnit = YGUnit.YGU_POINT
  closeButtonTransform.positionTop = 5
  closeButtonTransform.positionTopUnit = YGUnit.YGU_POINT

  // Add circular background for close button
  UiBackground.createOrReplace(closeButtonEntity, {
    textureMode: BackgroundTextureMode.NINE_SLICES,
    texture: {
      tex: {
        $case: 'texture',
        texture: {
          src: BTN_CLOSE_TEXT_ANNOUNCEMENT,
        },
      },
    },
    uvs: [1, 0, 1, 0, 1, 0, 0, 1],
  })

  // Add X text to close button
  getUIText(
    UiText,
    closeButtonEntity,
    'X',
    16,
    24,
    TextAlignMode.TAM_MIDDLE_CENTER,
    Color4.White(),
  )

  // Close button click handler
  pointerEventsSystem.onPointerDown(
    {
      entity: closeButtonEntity,
      opts: {
        button: InputAction.IA_POINTER,
      },
    },
    () => {
      removeUiTransformEntities(engine, containerEntity)
      engine.removeEntity(containerEntity)
      state.textAnnouncement.announcements =
        state.textAnnouncement.announcements.filter(
          (a) => a.entity !== containerEntity,
        )
    },
  )
}

function renderAirdrop(engine: IEngine) {
  return (
    <UiEntity>
      <Label value="WIP" fontSize={24} color={Color4.White()} />
    </UiEntity>
  )
}

function renderModeration(engine: IEngine) {
  return (
    <UiEntity>
      <Label value="WIP" fontSize={24} color={Color4.White()} />
    </UiEntity>
  )
}
