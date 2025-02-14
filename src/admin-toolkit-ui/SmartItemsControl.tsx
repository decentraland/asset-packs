import { Entity, IEngine } from '@dcl/ecs'
import ReactEcs, { Dropdown, Label, UiEntity } from '@dcl/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import {
  Action,
  AdminTools,
  getActionEvents,
  getComponents,
  getPayload,
} from '../definitions'
import { getExplorerComponents } from '../components'
import { Button } from './Button'
import { CONTENT_URL } from './constants'
import { State } from './types'

// Constants
const ICONS = {
  SMART_ITEM_CONTROL: `${CONTENT_URL}/admin_toolkit/assets/icons/smart-item-control.png`,
} as const

const UI_STYLES = {
  CONTAINER: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
  },
  HEADER: {
    flexDirection: 'row',
    margin: { bottom: 10 },
    height: 30,
  },
  ICON: {
    width: 30,
    height: 30,
  },
  SECTION: {
    flexDirection: 'column',
    margin: { bottom: 32 },
  },
  SECTION_LABEL: {
    margin: { bottom: 16 },
  },
  DROPDOWN: {
    width: '100%',
    height: '40px',
  },
  BUTTON_ROW: {
    flexDirection: 'row',
  },
  BUTTON: {
    margin: { right: 8 },
  },
} as const

// Helper Functions
function getAdminToolkitSmartItemsControl(engine: IEngine) {
  const { AdminTools } = getComponents(engine)
  const adminToolkitEntities = Array.from(engine.getEntitiesWith(AdminTools))
  return adminToolkitEntities.length > 0
    ? adminToolkitEntities[0][1].smartItemsControl
    : null
}

function getSmartItems(
  engine: IEngine,
): NonNullable<AdminTools['smartItemsControl']['smartItems']> {
  const adminToolkitSmartItemsControl = getAdminToolkitSmartItemsControl(engine)

  if (
    !adminToolkitSmartItemsControl ||
    !adminToolkitSmartItemsControl.smartItems ||
    adminToolkitSmartItemsControl.smartItems.length === 0
  )
    return []

  return Array.from(adminToolkitSmartItemsControl.smartItems)
}

function getSmartItemActions(
  engine: IEngine,
  smartItem: NonNullable<AdminTools['smartItemsControl']['smartItems']>[0],
) {
  const { Actions } = getComponents(engine)
  if (!smartItem || !Actions.has(smartItem.entity as Entity)) return []

  const actions = Array.from(Actions.get(smartItem.entity as Entity).value)
  return actions
}

// Event Handlers
function handleExecuteAction(
  smartItem: NonNullable<AdminTools['smartItemsControl']['smartItems']>[0],
  action: Action,
) {
  const actionEvents = getActionEvents(smartItem.entity as Entity)
  actionEvents.emit(action.name, getPayload(action))
}

function handleSelectSmartItem(
  state: State,
  smartItems: NonNullable<AdminTools['smartItemsControl']['smartItems']>,
  idx: number,
) {
  state.smartItemsControl.selectedSmartItem = idx
  const smartItem = smartItems[idx]

  if (!state.smartItemsControl.smartItems.has(smartItem.entity as Entity)) {
    const stateSmartItems = new Map(state.smartItemsControl.smartItems)
    stateSmartItems.set(smartItem.entity as Entity, {
      visible: true,
      selectedAction: smartItem.defaultAction,
    })
    state.smartItemsControl = {
      ...state.smartItemsControl,
      smartItems: new Map(stateSmartItems),
    }
  }
}

function handleSelectAction(
  state: State,
  smartItem: NonNullable<AdminTools['smartItemsControl']['smartItems']>[0],
  action: Action,
) {
  const stateSmartItems = new Map(state.smartItemsControl.smartItems)
  stateSmartItems.set(smartItem.entity as Entity, {
    ...stateSmartItems.get(smartItem.entity as Entity)!,
    selectedAction: action.name,
  })

  state.smartItemsControl = {
    ...state.smartItemsControl,
    smartItems: new Map(stateSmartItems),
  }

  handleExecuteAction(smartItem, action)
}

function handleHideShowEntity(
  engine: IEngine,
  state: State,
  smartItems: NonNullable<AdminTools['smartItemsControl']['smartItems']>,
) {
  const { VisibilityComponent } = getExplorerComponents(engine)

  const smartItemEntity = smartItems[state.smartItemsControl.selectedSmartItem!]
    .entity as Entity
  const smartItem = state.smartItemsControl.smartItems.get(smartItemEntity)

  const toggleVisibility = !smartItem!.visible
  state.smartItemsControl.smartItems.get(smartItemEntity)!.visible =
    toggleVisibility

  const visibility = VisibilityComponent.getOrCreateMutable(smartItemEntity)
  visibility.visible = toggleVisibility
}

function handleRestartAction(
  _state: State,
  smartItem: NonNullable<AdminTools['smartItemsControl']['smartItems']>[0],
  action: Action,
) {
  handleExecuteAction(smartItem, action)
}

function handleResetToDefaultAction(
  state: State,
  smartItem: NonNullable<AdminTools['smartItemsControl']['smartItems']>[0],
  action: Action,
) {
  const stateSmartItems = new Map(state.smartItemsControl.smartItems)
  stateSmartItems.set(smartItem.entity as Entity, {
    ...stateSmartItems.get(smartItem.entity as Entity)!,
    selectedAction: action.name,
  })

  state.smartItemsControl = {
    ...state.smartItemsControl,
    smartItems: new Map(stateSmartItems),
  }

  handleExecuteAction(smartItem, action)
}

// Components
function Header() {
  return (
    <UiEntity uiTransform={UI_STYLES.HEADER}>
      <UiEntity
        uiTransform={UI_STYLES.ICON}
        uiBackground={{
          color: Color4.White(),
          textureMode: 'stretch',
          texture: { src: ICONS.SMART_ITEM_CONTROL },
        }}
      />
      <Label
        value="<b>Smart Item Actions</b>"
        fontSize={24}
        color={Color4.White()}
      />
    </UiEntity>
  )
}

function SmartItemSelector({
  smartItems,
  selectedIndex,
  onSelect,
}: {
  smartItems: NonNullable<AdminTools['smartItemsControl']['smartItems']>
  selectedIndex: number | undefined
  onSelect: (idx: number) => void
}) {
  return (
    <UiEntity uiTransform={UI_STYLES.SECTION}>
      <Label
        value="<b>Selected Smart Item</b>"
        fontSize={16}
        color={Color4.White()}
        uiTransform={UI_STYLES.SECTION_LABEL}
      />
      <Dropdown
        acceptEmpty
        emptyLabel="Select Smart Item"
        options={[...smartItems.map((item) => item.customName)]}
        selectedIndex={selectedIndex ?? -1}
        onChange={onSelect}
        textAlign="middle-left"
        uiTransform={UI_STYLES.DROPDOWN}
        uiBackground={{ color: Color4.White() }}
        color={Color4.Black()}
      />
    </UiEntity>
  )
}

function ActionSelector({
  actions,
  selectedIndex,
  disabled,
  onChange,
}: {
  actions: Action[]
  selectedIndex: number
  disabled: boolean
  onChange: (idx: number) => void
}) {
  return (
    <UiEntity uiTransform={UI_STYLES.SECTION}>
      <Label
        value="<b>Actions</b>"
        fontSize={16}
        color={Color4.White()}
        uiTransform={UI_STYLES.SECTION_LABEL}
      />
      <Dropdown
        acceptEmpty
        emptyLabel="Select Action"
        options={actions.map((action) => action.name)}
        selectedIndex={selectedIndex}
        onChange={onChange}
        disabled={disabled}
        textAlign="middle-left"
        uiTransform={UI_STYLES.DROPDOWN}
        uiBackground={{
          color: disabled ? Color4.Gray() : Color4.White(),
        }}
        color={Color4.Black()}
      />
    </UiEntity>
  )
}

function ActionButtons({
  engine,
  state,
  smartItems,
  actions,
  selectedAction,
}: {
  engine: IEngine
  state: State
  smartItems: NonNullable<AdminTools['smartItemsControl']['smartItems']>
  actions: Action[]
  selectedAction: Action | undefined
}) {
  const selectedSmartItem =
    state.smartItemsControl.selectedSmartItem !== undefined
      ? smartItems[state.smartItemsControl.selectedSmartItem]
      : undefined

  const isVisible =
    selectedSmartItem &&
    state.smartItemsControl.smartItems.get(selectedSmartItem.entity as Entity)
      ?.visible

  return (
    <UiEntity uiTransform={UI_STYLES.BUTTON_ROW}>
      <Button
        id="smart_items_control_hide_show"
        value={`<b>${isVisible ? 'Hide' : 'Show'} Entity</b>`}
        variant="text"
        color={Color4.White()}
        onMouseDown={() => handleHideShowEntity(engine, state, smartItems)}
        disabled={!selectedSmartItem}
        uiTransform={UI_STYLES.BUTTON}
      />
      <Button
        id="smart_items_control_restart"
        value="<b>Restart Action</b>"
        variant="text"
        fontSize={16}
        color={Color4.White()}
        uiTransform={UI_STYLES.BUTTON}
        disabled={!selectedSmartItem || !selectedAction}
        onMouseDown={() =>
          selectedSmartItem &&
          selectedAction &&
          handleRestartAction(state, selectedSmartItem, selectedAction)
        }
      />
      <Button
        id="smart_items_control_default"
        value="<b>Default</b>"
        variant="text"
        color={Color4.White()}
        onMouseDown={() => {
          if (!selectedSmartItem) return
          const defaultAction = actions.find(
            (action) => action.name === selectedSmartItem.defaultAction,
          )
          if (defaultAction) {
            handleResetToDefaultAction(state, selectedSmartItem, defaultAction)
          }
        }}
        disabled={!selectedSmartItem}
      />
    </UiEntity>
  )
}

// Main Component
export function SmartItemsControl({
  engine,
  state,
}: {
  engine: IEngine
  state: State
}) {
  const smartItems = getSmartItems(engine)
  const actions =
    state.smartItemsControl.selectedSmartItem !== undefined
      ? getSmartItemActions(
          engine,
          smartItems[state.smartItemsControl.selectedSmartItem],
        )
      : []

  const selectedActionIndex = actions.findIndex(
    (action) =>
      state.smartItemsControl.selectedSmartItem !== undefined &&
      (action.name ===
        state.smartItemsControl.smartItems.get(
          smartItems[state.smartItemsControl.selectedSmartItem]
            .entity as Entity,
        )?.selectedAction ||
        action.name ===
          smartItems[state.smartItemsControl.selectedSmartItem].defaultAction),
  )

  return (
    <UiEntity uiTransform={UI_STYLES.CONTAINER}>
      <Header />

      <SmartItemSelector
        smartItems={smartItems}
        selectedIndex={state.smartItemsControl.selectedSmartItem}
        onSelect={(idx) => handleSelectSmartItem(state, smartItems, idx)}
      />

      <ActionSelector
        actions={actions}
        selectedIndex={selectedActionIndex}
        disabled={state.smartItemsControl.selectedSmartItem === undefined}
        onChange={(idx) => {
          if (state.smartItemsControl.selectedSmartItem === undefined) return
          handleSelectAction(
            state,
            smartItems[state.smartItemsControl.selectedSmartItem],
            actions[idx],
          )
        }}
      />

      <ActionButtons
        engine={engine}
        state={state}
        smartItems={smartItems}
        actions={actions}
        selectedAction={actions[selectedActionIndex]}
      />
    </UiEntity>
  )
}
