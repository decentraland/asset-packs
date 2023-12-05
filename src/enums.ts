import { YGAlign, YGJustify } from '@dcl/sdk/ecs'

export enum ComponentName {
  ACTION_TYPES = 'asset-packs::ActionTypes',
  ACTIONS = 'asset-packs::Actions',
  COUNTER = 'asset-packs::Counter',
  TRIGGERS = 'asset-packs::Triggers',
  STATES = 'asset-packs::States',
}

export enum TweenType {
  MOVE_ITEM = 'move_item',
  ROTATE_ITEM = 'rotate_item',
  SCALE_ITEM = 'scale_item',
}

export enum InterpolationType {
  LINEAR = 'linear',
  EASEINQUAD = 'easeinquad',
  EASEOUTQUAD = 'easeoutquad',
  EASEQUAD = 'easequad',
  EASEINSINE = 'easeinsine',
  EASEOUTSINE = 'easeoutsine',
  EASESINE = 'easeinoutsine',
  EASEINEXPO = 'easeinexpo',
  EASEOUTEXPO = 'easeoutexpo',
  EASEEXPO = 'easeinoutexpo',
  EASEINELASTIC = 'easeinelastic',
  EASEOUTELASTIC = 'easeoutelastic',
  EASEELASTIC = 'easeinoutelastic',
  EASEINBOUNCE = 'easeinbounce',
  EASEOUTEBOUNCE = 'easeoutbounce',
  EASEBOUNCE = 'easeinoutbounce',
}

export enum ActionType {
  PLAY_ANIMATION = 'play_animation',
  STOP_ANIMATION = 'stop_animation',
  SET_STATE = 'set_state',
  START_TWEEN = 'start_tween',
  SET_COUNTER = 'set_counter',
  INCREMENT_COUNTER = 'increment_counter',
  DECREASE_COUNTER = 'decrease_counter',
  PLAY_SOUND = 'play_sound',
  STOP_SOUND = 'stop_sound',
  SET_VISIBILITY = 'set_visibility',
  ATTACH_TO_PLAYER = 'attach_to_player',
  DETACH_FROM_PLAYER = 'detach_from_player',
  PLAY_VIDEO_STREAM = 'play_video_stream',
  STOP_VIDEO_STREAM = 'stop_video_stream',
  PLAY_AUDIO_STREAM = 'play_audio_stream',
  STOP_AUDIO_STREAM = 'stop_audio_stream',
  TELEPORT_PLAYER = 'teleport_player',
  MOVE_PLAYER = 'move_player',
  PLAY_DEFAULT_EMOTE = 'play_default_emote',
  PLAY_CUSTOM_EMOTE = 'play_custom_emote',
  OPEN_LINK = 'open_link',
  SHOW_TEXT = 'show_text',
  HIDE_TEXT = 'hide_text',
  START_DELAY = 'start_delay',
  STOP_DELAY = 'stop_delay',
  START_LOOP = 'start_loop',
  STOP_LOOP = 'stop_loop',
  CLONE_ENTITY = 'clone_entity',
  REMOVE_ENTITY = 'remove_entity',
  SHOW_IMAGE = 'show_image',
  HIDE_IMAGE = 'hide_image',
}

export enum TriggerType {
  ON_CLICK = 'on_click',
  ON_STATE_CHANGE = 'on_state_change',
  ON_SPAWN = 'on_spawn',
  ON_TWEEN_END = 'on_tween_end',
  ON_COUNTER_CHANGE = 'on_counter_change',
  ON_PLAYER_ENTERS_AREA = 'on_player_enters_area',
  ON_PLAYER_LEAVES_AREA = 'on_player_leaves_area',
  ON_DELAY = 'on_delay',
  ON_LOOP = 'on_loop',
  ON_CLONE = 'on_clone',
  ON_CLICK_IMAGE = 'on_click_image',
}

export enum TriggerConditionType {
  WHEN_STATE_IS = 'when_state_is',
  WHEN_STATE_IS_NOT = 'when_state_is_not',
  WHEN_COUNTER_EQUALS = 'when_counter_equals',
  WHEN_COUNTER_IS_GREATER_THAN = 'when_counter_is_greater_than',
  WHEN_COUNTER_IS_LESS_THAN = 'when_counter_is_less_than',
}

export enum TriggerConditionOperation {
  AND = 'and',
  OR = 'or',
}

// Defined values instead of using from @dcl/ecs because Schemas doesn't support const enums
export enum AlignMode {
  TAM_TOP_LEFT = 0,
  TAM_TOP_CENTER = 1,
  TAM_TOP_RIGHT = 2,
  TAM_MIDDLE_LEFT = 3,
  TAM_MIDDLE_CENTER = 4,
  TAM_MIDDLE_RIGHT = 5,
  TAM_BOTTOM_LEFT = 6,
  TAM_BOTTOM_CENTER = 7,
  TAM_BOTTOM_RIGHT = 8,
}

// Defined values instead of using from @dcl/ecs because Schemas doesn't support const enums
export enum Font {
  F_SANS_SERIF = 0,
  F_SERIF = 1,
  F_MONOSPACE = 2,
}

export type ScreenAlignMode = {
  alignItems: YGAlign
  justifyContent: YGJustify
}
