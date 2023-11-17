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
}

export enum TriggerType {
  ON_CLICK = 'on_click',
  ON_STATE_CHANGE = 'on_state_change',
  ON_SPAWN = 'on_spawn',
  ON_TWEEN_END = 'on_tween_end',
  ON_COUNTER_CHANGE = 'on_counter_change',
  ON_PLAYER_ENTERS_AREA = 'on_player_enters_area',
  ON_PLAYER_LEAVES_AREA = 'on_player_leaves_area',
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
