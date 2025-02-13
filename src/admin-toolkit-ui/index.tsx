import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Label, UiEntity, ReactBasedUiSystem } from '@dcl/react-ecs'
import { Entity, IEngine, PointerEventsSystem } from '@dcl/ecs'
import { getComponents, IPlayersHelper } from '../definitions'
import { VideoControl } from './VideoControl'
import { renderTextAnnouncementControl } from './TextAnnouncementControl'
// import { renderModerationControl } from './ModerationControl'
import { RewardsControl } from './RewardsControl'
import { SmartItemsControl } from './SmartItemsControl'
import { State, TabType, SelectedSmartItem } from './types'
import { Button } from './Button'

let state: State = {
  panelOpen: false,
  activeTab: TabType.NONE,
  videoControl: {
    shareScreenUrl: undefined,
    selectedVideoPlayer: undefined,
    linkAllVideoPlayers: undefined,
  },
  smartItemsControl: {
    selectedSmartItem: undefined,
    smartItems: new Map<Entity, SelectedSmartItem>(),
  },
  textAnnouncementControl: {
    entity: undefined,
    text: undefined,
    messageRateTracker: new Map<string, number>(),
    announcements: [],
    maxAnnouncements: 4,
  },
  rewardsControl: {
    selectedRewardItem: undefined,
  },
}

const BTN_MODERATION_CONTROL_ACTIVE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMUAAACoCAYAAABQUip0AAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAsqSURBVHgB7d09c9NKG8bxtXHSnnwDfAb6hIEazNBD4AMQDvRwoOf1A3CAHkLoIUDP4NAzhB6G0DPzmDavz30ZyZiNbEuyZMvS/zfj2HFC7JC9dO9qpVXNFdTBwcHC7u7ukt0vHTly5KjdN2u1WtO+tKCv6d6hyDr29+rY32oreLy1t7f33e43G43Gpr7mCqrmCkIN3f7Tlu0/a9E+XVYIHEpL4bC/8aY93LCNXluhcQUx1VAoCDs7O1fq9foF+7TlUGVtu60VISBTCYUFoWW/+F1HEBCtbbc162Y9d1Mw0VDYGOGKheGGxgkOGEEVw9rK/UmHYyKhCMJwl3EC0ph0OHINhbpJNl74j8qALEwqHLmEItiT9J89vOKA7D23Afn9vAbkmYfCukrLdrfqmEdAvjTPcTOPqlF3GemrDuuOQCB/amOrthFeDSZzM5NJpdAAen9/f52xA6ZB3Sgbu57Nqjs1dqXY3t5eskC8JxCYFm2UrZfyKei6j22sUOhNWELfs6sVBaAu1LptpP91Y0odCgvCimP8gILRFIBVjbtuDKnGFAqEvfBzBxSUjS/uabetSyFxKIJ+27oDCs7Gujfn5+cfuYQShSIc0Di6TJgR1mbPzs3NtZP8m9hjimC363tHIDBDrBu1nnRHUOxKYRXiG3uZMIuCeYwTcc/2i1UpNJonEJhVQbd/Ne73jwyFDvu2H3rPAbNtOe4cxtDuUziOoEqgJDq2m/bEqMNBhlYKuk0omYU43aiBlULHNNng5JMDyudio9F4PeiLA0PB3iaU1ai9UZHdp2Bw3XRACaltWxsfOOiOrBRUCVSABt1/R1WLQ5WCKoGKWBhULQ5VCqoEKiSyWvxRKbQkDYFAhXTXL/af/CMUlpgVB1TLoTbf6z4Fx4d8c0DFBF2orfDzXqWwQLQcUEHaudT/eX/3ia4TKsmqxJk/PteHYCGz/zmgovq7UN1KQdcJVWd7Xnt7obqhsErRckCF1ev1xd5jfQiuMwdUWa9SdMcUNvo+cEDFheOKus6bcAA0tu5mwbpS9aYDoMXTmrqvs1o48Es42K5zACDQ09QHdZ+OOgDS1Ie6jbZZBhP4pZuFumNtWCDUCwWAPjUm7oDfGo1GjUoBeAgF4CEUgIdQAB5CAXgIBeBpOKTW6XTcz58/e58fPTqdI2a+f//ee/zXX3+5hQXmY8dBKBLa2Nhwb968cW/fvnVbW1uHvn7mzBl3+fJl12q1cguJwvjixYvu+/j8+XP3836Li4tuaWmp+z70fpAMk3cxaWt89erVbijiun79urtx40Zm4VDjf/LkSffmB2EQheLZs2dTq2KzRpN3hCIGNcIHDx7Eboj9ms2me/fu3diNUqE8d+5cZHWK486dO90bhiMUMSgMuo1DfXwFQ92aNBSIkydPpgplP4IxGqEYQRXi1q1bLgsKxsePHxNXjHErhO/hw4fdbh2iEYohsto691OlUDCSUCCSjGPi0HtIW7XKjgMCh0g7hhhGe4pUfeJaW1vLPBCSVfUrKypFBFWJY8eOuTyoG/Xjx49Y33v8+PHMuk0+jXHYXXsYlWKAx48fu7yo+sTZ+quq5BUI0RwHohGKCGqQeYrTIPPoNvXT5COiEYoIeTfI/sMypvUeVIWyHjOVBaHw5NllSfIak2iw/cdt4TdCMQU0xmIjFJ5JHGEaZwKPI12nh1B41BjzbpBxfv4kDuDjIMFohCJC3rO9ceYHivAeqopQRLhw4YLLU5yfX4T3UFWEIoJOzsmrC6UtdNwxRZ5bc0IxGKGIoAaZ15GkOko1j+9NQr8b44nBCMUAajg6QSjrn5lkrKDvzTqc+p10NiAG44DAIbI8fFwNXAfhpemWZXX4eNpzOqqEAwJHUONRQx63YigQr169Sj1Oefny5dh7o8Kz/wjEaIRihHALnzYY6v6M2xjDLXzaU0nDk5s4sSgeQhGDGvSXL1/c06dPY4dDe44UBg2Ws9qTpVB8/frVraysxPp+va5eny5TMowpUlD/XrdwzSWNPbQImdZa0tZYuzvzboR6zXa73T0EvP89KLR6bb0HJuiS4xxtwMNAG4hAKAAPoQA8hALwEArAQygAD6EAPFy0JYZwcmxzc7N7r5ueC5+XcLJOs8h6rHtN5GkyLY/DK/TaWtoznEDUYgj9VzEKJ/F0C98D533Hw+RdBDW0cMZa91ksexNeXej06dO9me9xKZCXLl2KvXhbGA7NdIf3+BMz2gFtabVq34cPH7r3k1hzSQ00vBTYOI1T7/XatWuplsEMz+47f/58rpcjmyWVD4WqQH8XZFqyCEgW51yE7yHuAYdlVMlQpLlu3CQpILdv307cMPW7nDp1KpOunt6DqkeW1+ubFZUKRdHD4EsTjjwuNKPD1fUeqhKOyoRC3Qr1uyexTmzWkl7dNMtLkoXSVq9ZVIlQqIEkuXpQEWlArC123EUM8rrYi14/rxVGiqL0h46rOsx6IETdIYU77lVa81qeR/+XWXfPiqi0laIMFSJKnKubqtGqWuTVeMNTbcuotJUiHFCXkcI+atdrOJuel3BXdlmVLhTaA1PWQITiNMi8l8XM4+qxRVG6UOhk/lncy5REuHDCMJPYhVrWjU/pQlGVCxyOOt5pEms85X1dvmkpXSiqcnHDIvyecS5oOYs4nwLwEArAQygAD6EAPIQC8BAKwEMoAA+hADyEAvAQCsBTuvMpwoXByq5/4bNBJnEYRtnO3WbdJ8DDlYyACIQC8BAKwEMoAA+hADyEAvDUa7XalgPQQ6UAPIQC+K27GkT94OBgywFw4VCivr+/X851SoCErED8qhQMtIGeLX0gFEDAKkW316Tu06YDoDFFNwv1ubm5LQfAHTly5FcoLB2dMCFAVWkY0dv7pA/WhSrn8tFATJaB3jLu4eTdawdUmFWJXga6oWg0Guo+VWMNeyCCjSfa4eNuKDSusDvGFagkjan7pyZ6xz5Zn+qNAypob29vrf/zWvjAJi4W7Ivf7OGCAyrEuk5/R1aKoAvVdkC1tP2jOv44dNyqxWMHVMua/0TNf2J3d/e93bUcUHKqEOo6+c9HnWS05oAKsJ7R/ajna1FPasBt/6DpgJJSlajX62ejjhKPPB11UIKAsrApiLVBp03UBv0jxhYoq0FjidDAhQuoFiirUW17YCjm5uba7KJFCb1uNBrPh31DbdgXNcttfa9PDLpREh3rNp0YdQr20HWfNMttofjHASVgbfl+nDUJRi6GRjcKJfF8fn7+UZxvrLmYbO5C3aglB8yYYXMSUWIvm2k/9CLL4WAGdZIEQmKHQj/UqsVFxxl6mC3/JN2YJ1pg2fpkOjuPgTdmgg2sb9ru18TrDyRedTx4EYKBQtMEXdyBtS/2QNu3u7t7xe5WHVAwCoTtNb3nUkodCrFgLLtfweAUVhSCukxpK0RorFDI9vb2ks0SrjPrjSnrWBu8qHk1N6axQyEKhCX0PcHANCSdhxglk8t7hYfiMvONSdN5ERaIE1nOoWV6zTsrXf+6FPuFgRQ6wfjhSrASTWYy6T751I3a2dm5ZwlecUD22tYzyW3jm0soQhaMlgVjlbEGsqAQ6KjtLAbTw+R6yWC9+eC0P7pUGIf2LN3X2CHvQEiulcKnCT8Lx10qB2JSGB43Go1HWY8bhploKELqVtkvecMeLjvgsHYwK912UzCVUIRUMfb29lr2UAPylkOVKQgbk64KUaYain7BquctG0gt2zhkkROayk1jTPsbt+3hhv29X087CP0KEwqfQmJjkCWFw/7DmnY7ak8v6LG+5jjequg6QUPXuEAB+K57XSBFV84qUgh8/wcRhmuTYD6aKgAAAABJRU5ErkJggg=='
const BTN_MODERATION_CONTROL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMQAAACpCAYAAAB0zJLvAAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAYISURBVHgB7d1PUttmGMfx55FNwpIb1D1B3RPEOUGSTRtWQTMlna6AEwROAFl1Cp0RrEiyIZwg7glCbuDewEtIsN6+74tJHVtYsqyXgPz9zCSTZF57hKOfJb3/HhEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwK1SQWlJctySL40V0cGKmEZflpZ6cfysL7coSU5WRM5X5FJa/h+ay2e3fQx1QiBmlBwcd1T1hRh5av+6ktHkTCLtmih9HcerPQnAhSC6/LxhxLhjaE80UOnZ37vGmKN4fbUrKIxAFOSDIPrK/rFT+EUqh6ZhdqoKhguCXn62x2A2C7/IhsMew+NQ4awbAlHA0cHbV/bbeFvKcCdkGj2LX/5yJnNI9t+1VdIT+34tKcGGefvF+q87gqkIRI65wvC/vjHR47KhSP5++1SNSST7Fq0wQpGPQExRURiu9U3T/DzrrUvy53FLm/pR5gzDNZPKVvz78z1BpkiQyZ2IFYbBsff/msz4GtGGfpCKwuDfL5Jdd/slyEQgbmC/lWc+eQvoJPvHa0Ub+7YlnxmmUU13BZkIRAbXoySz9CbNwHbZbhRue9WrFUJn+DNiDIHI4McZwmkXORl9mwBXh69UnwomEIhsge+xNf/9A5+wauSRYAKBGOOnQpiwgVCVn3LbmPw2c+LBOgOBGHd+XlmPzhSt3BYqwY/Dz8XCNwjEXZXKbQQTYwjEXXU1QS+wZWbFjiEQY+I//Ehy0BPFiHzKb2P+lbD6TBOfRCCyzTURL1dqCry/hj0GDfwz3lMEIoP9Bj+VkJakm9um+fBQAjKpORJMIBBZrk7GMLcTKodFJvgNb2e6EoJ7Pllafi+YQCAyuJPR3sO/lgDcgqHCbcUEmartV9Lx/JCJQNykubxnz8ieVMid4LNM/3bLP41KtcG0Vwf7vtuCTATiBv4qMTCPKwuF0fdlTsT4t+duuWhXqjBcTiq4EYGYwnXBVhIKGwaz9CCWkkzz4TOZNxSsrS6EFXMFDFetufURHZmR7bHaiterWaGWHBxvl5oSrtK1YYgJQz4CMQO3YEcj3Sg0+U/tVaGRblV9ErpwSlNcMPKnqKvfimaHrWiKIxAl+CWYmrr9mR7Za8BwzpH2/eiyG3SzXZqhe3F8MBr2ihVp2/4njs6M7RljR8JN1J13pw8AAAAAAAAAAABUh4G5AvzuFIOoLca07Ej1DzKQlqhx29W0vmmofg1FX4wdpNP0kxusswN3ZyGq+vhaEYOLXUkzppO49Q72GOzAXc+kbimqPQbT6DNQl49AjPH7Ml2etzWKnthRZzdFw/2afwcMd5KmembU/FPVKPJwjtWJFN9jyYXSVTg6M2l6SvmtSQRCrkNwsWY/jCcSaE/XCddlr0RPpfGgW/bEHAZ4r9Dcpmy+9JZb1srkvwUOxHcJwTSu/NYcNeEOD964bfM7Mp9hOMLPxbqrFi4QIwUL3cKbu7cZmC/BZXbil6uHs7zMP1N8ufhYyQbJ11evCuvj3RcLE4g7H4RxJYJRdbWh4XEcLlIwFiIQR/vvNmyvz7bchyCMm3GlW+lFRHnHUOKqdR/VOhBfuyaNrMk9V7Q2XKW3ThN0zzQf7NT5+aK2a6qvajpffKhDGBxXG84Vgcxr5zdH0FCbkJlN95n6Domaqm0gfBhqVgPBFYFM/nqzmdvQbaETbn/atv1sT6SmahmI4TdpLQuC+CqiOSW5hrc0IUelXY26bamh2gUiQDndO6fIQ3Po/WntMWzU8dapfleI5kIUE+zkVv9R7UlYboQ8//btnqldIIYjz/WX5oxKp8ED4TZgq91taf2uELogpajSnG7VwSB416h9ngldGPLW1S8Q1GbDHNjbFRhBIIARBAIYQSCAEQQCGEEggBEEAhhBIIARBAIY0ZSaMUuLUmVzeerUDFcwMkmOfxQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAr/gMt3zlloPkVzgAAAABJRU5ErkJggg=='

const BTN_REWARDS_CONTROL_ACTIVE =
  'data:image/png;base64,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'
const BTN_REWARDS_CONTROL =
  'data:image/png;base64,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'

const BTN_VIDEO_CONTROL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGIAAABUCAYAAAB5huK+AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJrSURBVHgB7dsxbhpBGAXg9y9IaX0EfII4Jwi+AakClVkJW0oV5wROTpC4igRIu1QYN/gGdm7gG4QjUMaK2T+7FLGE4iTFMvPP7PsaoEM85u3M7CxAREREREREREREREREREREjSYwKpvMuyJyggJduCBYqeosPRvk8MBkELPp4qT8UXL4IMiHo34Kx8wFkX2dd6Qt3+FR+SdIXY+MBNa0HFXRX2wr0TF7QQg68M3Dd7AXREMxCCPiCEKxQuC8BJFNF71ynfAxy+Yd1GB41j9UwSUC5jyI2WRxIapLgVzIRm6zbHmAGqSj/nk17SzfrhEg50GoaO/pQzk7KX70UJNq7q+P+irEqnJfTQVqGQHPSd8NViFWVbSzptCqKurpa0hVFf06IpSqasyC7ndVGR0djVpZb6tK1PkW9/9o3BZHguQ1DGqjIaqFo2wePpf1NIRBjQgiG18fyc+HpYkt9mdEX02z8fV7keLWcgiVaEfEUxUVQwQgyiBCqKJd0VVTKFW0K5oREVoV7YoiiBCraFcUQWyrCPvdXt+3WK4RQYdQ4SkOIxjEn6j7m0kWg7iDb4J7OGYuiPR0cOf7noG29BMcM1lNutFjT2GsFfiQpoMVHDM5fa1ub5Yvh9VBNGhxBCdkjfaLPE3feDlsYHodkY7e3pQvN2gAzpqM8B6EFMlLkIVq0vN8enWghX7DviXJGq3i3sfF+F+cP0OXT66qfaEufKmeHm3psbUw3B9CVp3Bp+rg86PUdvC5Ls6D2J4tgu8w1Nx5WG+P92bj+VCS7dObHTikisv0tP8FRERERERERERERERERERERJb8AiZz3murtGSnAAAAAElFTkSuQmCC'
const BTN_VIDEO_CONTROL_ACTIVE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGMAAABVCAYAAABdGFolAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAATkSURBVHgB7Z1PTttQEMYnIWFLFuxJJfa0J4CKA0DFHlLY08IBKHAAStkjAnskegCEYQ1SOABquEHYEv50vsiOjHESJ9jvje35LbCxE0j8eWbevPf8pkAJ8Pr6Wn1+fv7Mu5WXl5dKoVCoUIbg79cqFotNbEulUoO/X4tioEAxwB+qwhd/kXdn+YPNQQzKEfydG7xx+Mb7Wy6XHRqRD4nRbrfn+A5Z4Itf418zdfePCgsDi9kZGxtzsD/Ue2kEXDf0i3drpITiClFnUXYiv4eGhEX4wWJsk1pCJCAKe4+vUaykSBGBNTw9PV3wdp9UiMi4XuSf60n6Esky8Ac5OF3kLTDHDVvHPrutjZ7naQAqROyccXP4W9iJvm5KhUiERXb3R2EneoqB3EGFSIwax5DfwYM9xcCLVYjk4Gv7ky1k0X8sNGbwi2q8OSIlaVoc0D953SnvLAPWwCcHNsOUWEAo6F7rd2LwyRV1T+aAu/KudzFwAgdrpBjFSwiLgYO563EVQg2t1zdicKz4QYoVuAe81m1NeX0opNjC6VoGXBQpNpnzu6kFUqzSFYPjRZUUq3RjBmfdrySU29tbajQalDSVSoWq1SrNzMyQDUr44QZvksb9/T2trq7S5eUlmQSCnJ+f09TUFJmkYxkSW1IQYn5+nprNJtkAglxfX3esxRSRh11N4ziONSEA/vfJyQmZRKwYV1dXZBvEKpOIFSOPqBiCUDEEkRkx0PrZ2tqiNGNNDOQOk5OTND09TQcHBxQHEOPm5qYjTBqxJsba2hq1Wq1OE3Jzc7OzHwfInpGwLSykr6vNmhjBHOLh4YHiApnz6elp6txWpgN42txW5ltTaXJbuWjapsVt5SrPkO62cpf0eW7L1phFP3KZgcNtrayskDRyKQYSzt3dXZJG7sRAgolBq7iSzDgpUU6wNYQ7DLkQAwIsLS2JtAY/mXdTkt1SkMxaRhrcUpBMipEWtxQkc24qTW4pSGYsAxcfIqTJLQXJjGVAjDQLAXRCgiBUDEGoGH2YmJggk4gVY3l5mWwzOztLJhErBi6EzW7u9fV140O1opu2h4eHnbEHzAY3NSMdo4CwShtDtNaezyiV3t4Hd3d3xh9OkYYGcEGIEcPmgzFSECMG5tumsT8pTsTEDIDn50w8Q4f8Aa0laZMSrIkhoVMPc6gkTdmx5qYkzO6TFqesiYGkbm9vz9rsPvxfafNvra+QgKCNp0pN36UQwuQz3lHoioGYoQt/2cW/xFG6R2YygD9mJL9SitIXXYlNDo5/vakmDpBii+M3TVvUDCLFCigL9EaMcrlc502+O4jsUO9UoPEfwZrcHDv+kGIUry7TuwycO/BQxketwxx1rx7TOzHcFes3SEkciOCvVhbaN8XWUefNGSmJgnp+/iplPTsKWbHvwxb9U6IDIdybvkthwBu05lIyhBbB6tuFDsvgrPybWkh8oA4svE7YuYHjGePj442oFRiV/rCXOXavZWhrNdLgkq8kpnYmjghiBN/YtX7lqiOP9LnNsC/4o6RExq2C/JV7N7YHvpZGAAG93W5vs7XIW/NBDp3eDCTRUYu3f6geuIoSytAieHxIDA/UC+JWFwoAYoR/jnJWFRmuyO3xPmN35NCIxCJGkMfHx8/8ASuoyZHFHIW/U4u9QYsFaPDFbw5rAb34DwNGVk0zmJdtAAAAAElFTkSuQmCC'

const BTN_SMART_ITEM_CONTROL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGMAAABVCAYAAABdGFolAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAALjSURBVHgB7dpBbtpQEMbxeYDUbW7QLLvMEcIJqmzasCqWaLZpT5D0BCWrSgTJZtWQDd11yRHKEXIEtq0av75xSUstbIOp7ZnH99skAUtI/OXBTEwEAAAAAAAAAAAAAAAAAACwnTCcHZFgLToQ4afPx/T445QEO4gYHMK0zZza8YIE8z7GnxCGlkHQeyDBvI6xFuLYEk1IOG9j8Ie16ZgZh0ge6NgvJJy3MczP73P342T150L6iGJexojGdyH9DUEaRhTzLkZ0O/3o3v3+Pw8qGFHMqxiT2+mVOw/epR5WMaKYNzE4hCV7nX5cy4hiXsTICpFQMqKY+hiT0f1lZghFI4qpjjEZT99YEw+zntc0opjaGOHo/sRaG+UepGhEMZUxOIQx8bzgMFUjiqmLkeybKJ65X3P/N6FtRDFVMdYXf4UHKxtRzJASO4UgWrorrBval2ktgsHr2qJ2SIEdQ7AjQ+aK9mHowbbjiGrUJuGSVTg9fnVvzguqSxLCduu+ABD/mZFahdfwgs2EYKJjpFfhlWswBBMbY+MqvFpLG7fOmvxuIjJGxiq8Uta2usHFq0bvHhEXI3cDWxG3VgmaDsFExWgkBNH74KIXkQBiYhSswivhXu9D8PZ8SEKI+AaerMKLNrD/2e8QvWsSpPEYqw3sN6qRxBCs+XWIiU/5zaE9GGOeb3sZbA3dBAN5IZiaRWGecHw3NJYui45z0SfujOiTUF7ckGBiernFYQvJIZj6GPyZs8U2d2E7z7oknP4zoxX3c5/nfVPHujXH2ZKEUx8jd0Q1vPjbleoYuSNKWQim+8zIGlEKQzDVMTJGVOOr8LJU38S2aURJWIWXpffM2DCipKzCy1IbIz2iJK3Cy1J7e+f6iJK2Ci9L55mxNqKkbmDLUBnjaUT5FILpu/F5NaKSVbhHIZi+M8ONqGQVPjiv9e4R2CAaTWfkKRU3Pj/h+27dJWxAAAAAAAAAAAAAAAAAAIfuF5EyN57u1xweAAAAAElFTkSuQmCC'
const BTN_SMART_ITEM_CONTROL_ACTIVE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGIAAABUCAYAAAB5huK+AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAATiSURBVHgB7Z1NTttAFMdfTNinJ8CV2NMK9k3FHqg4QFpxAOACNHCC9gCoyQn42CPoHlSyRyI5Qb3nq+/veiKTOP6K7Zln5ichJ46FhH+8NzPPMK9BBfDy8tJ6enraajQaK/za5eMHnOOPWlQz+Gcb8s825OMtHwcLCwtXOEdz0qCc4EY/Pz/v8rHNb9v0hgmk/JxHSmYRIQF7VMPf+ALosZDDrEIyieD0890KSAeL6EJI6uvTXIS8z1FwwscPZEkNosJxnM9posNJuoBvfocj4Y+VkB38AuPePT4+biVdGysCqYi/emRT0Tzg3p3gXsZdNDM1BeNBlyyFETduRIoIQumELIXDIr6ykP7k+SkRKq+RTUdl4bGMj5MD+JQIlnAPGWQpDSwAISN87tVgHYwLLllKBTPQh4eHbvhcI/QhUtI9WaoCKeo9R4eHN+OISJpeWQqnxZOiPfXGjwgbDdoYR4UfESyhTRYdjKPCF8FGdsmiBb73n/yjTUv64fT0zrFpST94uum8hapqv98nk4GDJp4zU405Ojoiz/PIcFyIcNkI1RFEAkTc3NyQySAYGjx9qqWFs7Mz2t7eJtd16e7ujgzHS3xCJ5HBYEA7Ozv+642NDRJAq3YRMRqNaHV1dTwuIC2trJg/DNYqIiBhfX19LAFpSYIEUBsRSsJwOByfE5KWfGohIkoC6HQ6JAXxYwTS0Nra2pQEIbOlMaIjAhKiIgFISktAtAhMUTFVjUJSWgJiRUACFm1RSJotKUSKQNkirpAnLS0BcSIgAV9xSEtLQNSsKY0EabMlhZiISCMBSExLQEREYDxQRbwkpNSWJjFehCpnV8nBwYH/VSVGi8AaIVzEqwIdEoCxIibL2VWA2dbx8THpwMjBerKcXQWbm5vaJADjImJWJbVMMLhfXFxQq6XvX0KMEqFDAtYd19fXWiUAY1JTXCW1LCBBdyQojBChU8LS0hKZgBEi4srZZWCaBKBdRFw5uwyQhkyTALSKSCpnF42pEoA2EWmLeEWCdYKpdSjRfzyAcQWr7zRAgsnPKUQ/s06b1lA7Mv1hkeiIWF5eTpzy6iriZUVsRCAt1UUCECsiKS1JkgDEpqa4tKSznJ0XkRERl5Z0l7PzIlLErLSENYJECUBkaopKS6aUs/MiLiKi0pJJ5ey8iBMxmZZMrKTmQVxqCqelukgAiAjj/xtcEU5LJldS8+CoHbQkoNJS3SQwQ+zFcUtCOD8/948ml7Nz4osYkQBUWoIELNrqBPpQIDWJiAikJQnl7DzAQSPohvKXDAci6igB+Pv64QVPYS/pjXdF0YXajNdf0HFU/CaLFtASB0e13Wgr2NfP7gdeMcF2o0O1y6WnzFgqpac2aw9vSW2jomJUNOD1uOhno6Ja+F6/6swV1bbA9hMqGQhANITPTZXBHcf5QoIKgQLx0Ilr8uSUiCBc9slSFt+i2qFFPhhqNps95DCyFAruKd/b06jPYhsCousH27N9JQoAEhYXF7uzPk/szBh04PpFdlqbF4y3+8gycRdlaZF5afsPZQN1JEx+CmmRGXxDf7plx43UYE12GNXmbBZ52ii7GDvYdD1r0vPhL4o5Df3I+gg6swhF0ACkjW4sdgFIV6hg5xGgyC0ijJICIf7O7/934HepfnhBKQgd3UfBs4TTIv4A4x/QZ+ZmqV3y4AAAAABJRU5ErkJggg=='

const BTN_TEXT_ANNOUNCEMENT_CONTROL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGIAAABUCAYAAAB5huK+AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGfSURBVHgB7duxTRxRFIXhc20kp5RAKS7BztjIO9Laqe0KMCU4BaQZIiCiBjqgBOhgUyTEZWYJYKeAd480/xdssNFofr37kjsSAAAAAAAAAAAAAABYtFCR/uxqHRE/lDqSg9BDZl52v1aDCpSEGC6u+zHAWo5Cw3pz3KmxT2psOgm2ESbjs+2esbHmIXbjyFzFMx6otelOmA3EDP3XS96rQuhraPbio/291T7E3DiTu83xH9UZ+ovrbaR+q1Dz0TSXkXeqVnUaPygPgTeEMEEIE4QwQQgThDBBCBOEMEEIE4QwQQgThDBBCBOEMEEIE4QwQQgThDBBCBOEMEEIE4sP0fe3hw5Lb/V7TTOX5zcnGXmkVp6fvo2/h3v/pbZqzCrEtJycmdNubK1Q8z0nm9HktCGen/NUjVmEMIqwHQ/j365bPaix8tEUGSd7H6uEhnE8Paq52Orgy9B135vfD5P6O+JDhFSedpvVPy2QzR2xi/BzmREmFiGWHmFSv5ZPhJ3SEER4VxaCCPtKQhDBQMWnswAAAAAAAAAAAAAAAPZeARLVd6ESSYnTAAAAAElFTkSuQmCC'
const BTN_TEXT_ANNOUNCEMENT_CONTROL_ACTIVE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGMAAABVCAYAAABdGFolAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAROSURBVHgB7Z1tUuJAEIYbiP5mT0D2BOIJwPIAuCeQLf+76wn8uMCqB1A5gCUcwCIcwFJPsHADfivCduME+QgQIMx0Le9TRQVCAJ2H7plJQpoIqCFFCdHr9bKdTifPy3wmk8nJY17t0/9Hk/+3ViqVeul2u83t7e0XSoiVZEiDv7+/l9PpdIkf5vmWpc2jzbcq32qe51VpBZaSwRJ8/lb84mWZNlNAJBwtTV7c8ZezYu4v9vpFNpZIYAmnvPxNYCoi4uPj44pT2OVCr4u7IaejIn/IAyESYiNSOEr24kZJOs5GbPkPv2GdIGIhJJ1z2z2/vb3FyiSpOW+WFRF8t0xgJfjLfMajzPOZ20x7wvQPdRmqEkiEeUKmpimOiFuISBZuzzNu19Npz0fKMC84IJA4IoQnx5FtO5GmzIYPBNZJm9PV7vgoa0SG6SeeZRRAYN0EPGPfG14xkqbMrNonYIOizN2GVwwiw4yJ/xKwyUh0DCJjVi8P1sZIdAxkcGdSJGAdbvdBEPRlyAgKfYUziubYzyAySgScIceEZNmXgRTllrD9U7xHMc+7eZ8JuKTNo6pv7CHtE3BNVvoNjyd6Pgsh27TbbarVatRqtUgLOzs7VCq56T653/A9zlc+WUYE7O/vU7PZJG0UCgW6v7+nbNbucTQOiHw6HFbZRKsIodFo0MXFBbnAen6S1KRVRMj19XU/jdrGI8u8vr5OrJOU4CpXh33XOJJKbacq6zKieHp6olwuR66oVCp0dHQ0ss5FZNgfRo0hHaZLEcLh4SFpwLkM8AVkKAIyFAEZioAMRUCGIiBDEZChCMhQBGQoAjIUARmKgAxFQIYiIEMRkKEIyFAEZCgCMhQBGYqADEVABpGa831VnDc1jDRMEARkC/k8OYNQA6pkaDoh2vd9so2aNKVJhKsT61TI0BYRNzc35ALnaWpchJxsLD9asU34ucfHx9ZPeA5xLmM4GqQRHh8fncjQgJo+Y9NFCCpkQMQnzmVAxBdOZUDEKM5kQMQkTmRARDTpZa7ZvQoQEU2v12umOp1Ome/fEnBKt9vdlR/lNwk4R+pwpD3PS6wYB1gOKYwiS+kz5AfPAQFncIpqyLI/muJU1SDgkn5FmnBoGxBwgoxmt7a2Arnfl2EeBASsw1kpCO8PLjJsKsfUCVglk8l8D+d6gxk4osMJd8OT7pEL0yM67BFVj2lk35REBw+zKgTWjlQrm1myQUDZBitUebL9Y3zlxF5bmQSyNdnQ/tWvNgCJBu60T6Kei9yFbuqVRr4ALM+8un0zS8Nhj25yxCmgOLeCpanBJEJQMHFJ4layjFVO1BTWraNTX4oq9xE/zQ7ZmcQ67Go6ne8s45xAXNr8BT6RUVMcEcLCJaglOnhyeMZhp+OSl/pocxtdsYTLuBJCli7OHkrhiCkgfX1mD5kwLyNh8B6UAKaI0wH/EXKWgZQg3YTOXhr8xRwLCsLd4KvwDwrI30STdOsJAAAAAElFTkSuQmCC'

const BTN_ADMIN_TOOLKIT_CONTROL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAtCAYAAADV2ImkAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJbSURBVHgB3ZmNcYMwDIXNBtmgbFBGYAQ6QTJCNoARugFskHYCukG6AekEZAPVFKfn+GxZkuFI++503BH56YsB/4BSf0yZegABQKEPU1x1fGZZdlGp0qaljlZHb46lSpT2yI2fq1qlyADCksYGdoCwZN4IrNiYACvzJsCyjRHYXsco9g7ADjoq8BeMGiOwnfm9EEEjsHmkcC2FtfJ40DFYAkAthSVAlyJYDjQXNgLd2wk1B5YCLYV1oG2N9o8DFxYx/i0ghTW+tdP2bPeSWygnmu4mI6CpU0SB/4q3dlFXe4KpDTvAPH0PK8EOd50I/jl9HzFuXTMQDHkE2OmKF25iCX7tEfNXSBzyRLBWgwMXGinOgmbDbgktht0COhl2RWjfmNwvArs0dKAXYVHYpaAd2Nuosg5sKrTTrjHnQvd0q5aUNjxyoa02jXM+aXKhwIYKUKBzpmfyjpm6YVx9ckkx7B8OGuIbxs2mcTaslbfUOI3ddrW0cRfITx2n7Xpn4PY0BzYV2gO7g3CHHX0GFRc2Bdqq9wMb+CM3jXbOLbFxkk6KKMDXCxh0ETjvWzCVblLnJBxUOmwUOuC58/Ry6Sb1TkJFMK49cGMKNIR34nkMuBTCTu8ppA9iCLb1JQ/oPyLCWjksaAT27qG0G9wpBZYLzYb1AcO8PJxGjlbHCcIDO7r4jkGLYE3DHvgi7RQQ6EYEa0wrWAGWAM2HtUwbomkPxBeGTGgUNguY5vpw0PGk40vNH/ymuJi46o9/VyUUzBOSbw/3oeMF897sS6jplGlB86zmTnjXoG/qv+kbyJ2QgTbpuF4AAAAASUVORK5CYII='

const containerBackgroundColor = Color4.create(0, 0, 0, 0.75)

export function createAdminToolkitUI(
  engine: IEngine,
  pointerEventsSystem: PointerEventsSystem,
  reactBasedUiSystem: ReactBasedUiSystem,
  playersHelper?: IPlayersHelper,
) {
  console.log('createAdminToolkitUI')
  reactBasedUiSystem.setUiRenderer(() =>
    uiComponent(engine, pointerEventsSystem, playersHelper),
  )
}

const uiComponent = (
  engine: IEngine,
  pointerEventsSystem: PointerEventsSystem,
  playersHelper?: IPlayersHelper,
) => {
  const { AdminTools } = getComponents(engine)
  const adminToolkitEntitie = Array.from(
    engine.getEntitiesWith(AdminTools),
  )[0][1]

  return (
    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        flexDirection: 'row',
        position: { top: 45, right: 10 },
      }}
    >
      <UiEntity
        uiTransform={{
          display: state.panelOpen ? 'flex' : 'none',
          width: 500,
          pointerFilter: 'block',
          flexDirection: 'column',
          margin: { right: 8 },
        }}
      >
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 50,
            flexDirection: 'row',
            alignItems: 'center',
            padding: {
              left: 12,
              right: 12,
            },
          }}
          uiBackground={{ color: containerBackgroundColor }}
        >
          <Label
            value="Admin Tools"
            fontSize={20}
            color={Color4.create(160, 155, 168, 1)}
            uiTransform={{ flexGrow: 1 }}
          />
          {/* <Button
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
                state.activeTab === TabType.MODERATION_CONTROL
                  ? BTN_MODERATION_CONTROL_ACTIVE
                  : BTN_MODERATION_CONTROL,
            },
          }}
          onMouseDown={() => {
            state.activeTab = TabType.MODERATION_CONTROL
          }}
        /> */}
          <Button
            id="admin_toolkit_panel_video_control"
            variant="text"
            icon={
              state.activeTab === TabType.VIDEO_CONTROL
                ? BTN_VIDEO_CONTROL_ACTIVE
                : BTN_VIDEO_CONTROL
            }
            onlyIcon
            uiTransform={{
              display: adminToolkitEntitie.videoControl.isEnabled
                ? 'flex'
                : 'none',
              width: 49,
              height: 42,
              margin: { right: 8 },
              alignItems: 'center',
              justifyContent: 'center',
            }}
            iconTransform={{
              height: '100%',
              width: '100%',
            }}
            onMouseDown={() => {
              if (state.activeTab !== TabType.VIDEO_CONTROL) {
                state.activeTab = TabType.VIDEO_CONTROL
              } else {
                state.activeTab = TabType.NONE
              }
            }}
          />
          <Button
            id="admin_toolkit_panel_smart_items_control"
            variant="text"
            icon={
              state.activeTab === TabType.SMART_ITEMS_CONTROL
                ? BTN_SMART_ITEM_CONTROL_ACTIVE
                : BTN_SMART_ITEM_CONTROL
            }
            onlyIcon
            uiTransform={{
              display: adminToolkitEntitie.smartItemsControl.isEnabled
                ? 'flex'
                : 'none',
              width: 49,
              height: 42,
              margin: { right: 8 },
              alignItems: 'center',
              justifyContent: 'center',
            }}
            iconTransform={{
              height: '100%',
              width: '100%',
            }}
            onMouseDown={() => {
              if (state.activeTab !== TabType.SMART_ITEMS_CONTROL) {
                state.activeTab = TabType.SMART_ITEMS_CONTROL
              } else {
                state.activeTab = TabType.NONE
              }
            }}
          />
          <Button
            id="admin_toolkit_panel_text_announcement_control"
            variant="text"
            icon={
              state.activeTab === TabType.TEXT_ANNOUNCEMENT_CONTROL
                ? BTN_TEXT_ANNOUNCEMENT_CONTROL_ACTIVE
                : BTN_TEXT_ANNOUNCEMENT_CONTROL
            }
            onlyIcon
            uiTransform={{
              display: adminToolkitEntitie.textAnnouncementControl.isEnabled
                ? 'flex'
                : 'none',
              width: 49,
              height: 42,
              margin: { right: 8 },
              alignItems: 'center',
              justifyContent: 'center',
            }}
            iconTransform={{
              height: '100%',
              width: '100%',
            }}
            onMouseDown={() => {
              if (state.activeTab !== TabType.TEXT_ANNOUNCEMENT_CONTROL) {
                state.activeTab = TabType.TEXT_ANNOUNCEMENT_CONTROL
              } else {
                state.activeTab = TabType.NONE
              }
            }}
          />
          <Button
            id="admin_toolkit_panel_rewards_control"
            variant="text"
            icon={
              state.activeTab === TabType.REWARDS_CONTROL
                ? BTN_REWARDS_CONTROL_ACTIVE
                : BTN_REWARDS_CONTROL
            }
            onlyIcon
            uiTransform={{
              display: adminToolkitEntitie.rewardsControl.isEnabled
                ? 'flex'
                : 'none',
              width: 49,
              height: 42,
              margin: '0',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            iconTransform={{
              height: '100%',
              width: '100%',
            }}
            onMouseDown={() => {
              if (state.activeTab !== TabType.REWARDS_CONTROL) {
                state.activeTab = TabType.REWARDS_CONTROL
              } else {
                state.activeTab = TabType.NONE
              }
            }}
          />
        </UiEntity>
        {state.activeTab !== TabType.NONE ? (
          <UiEntity
            uiTransform={{
              width: '100%',
              margin: '10px 0 0 0',
              padding: '32px',
            }}
            uiBackground={{ color: containerBackgroundColor }}
          >
            {/* {state.activeTab === TabType.MODERATION &&
            renderModerationControl(engine)} */}
            {state.activeTab === TabType.TEXT_ANNOUNCEMENT_CONTROL &&
              renderTextAnnouncementControl(
                engine,
                state,
                pointerEventsSystem,
                playersHelper,
              )}
            {state.activeTab === TabType.VIDEO_CONTROL && (
              <VideoControl engine={engine} state={state} />
            )}
            {state.activeTab === TabType.SMART_ITEMS_CONTROL && (
              <SmartItemsControl engine={engine} state={state} />
            )}
            {state.activeTab === TabType.REWARDS_CONTROL && (
              <RewardsControl engine={engine} state={state} />
            )}
          </UiEntity>
        ) : null}
      </UiEntity>
      <UiEntity
        uiTransform={{
          height: 38,
          width: 38,
          pointerFilter: 'block',
        }}
        uiBackground={{ color: containerBackgroundColor }}
      >
        <Button
          id="admin_toolkit_panel"
          variant="text"
          icon={BTN_ADMIN_TOOLKIT_CONTROL}
          onlyIcon
          uiTransform={{
            height: 'auto',
            width: 'auto',
            margin: 4,
          }}
          iconTransform={{
            height: 30,
            width: 30,
          }}
          onMouseDown={() => {
            state.panelOpen = !state.panelOpen
          }}
        />
      </UiEntity>
    </UiEntity>
  )
}
