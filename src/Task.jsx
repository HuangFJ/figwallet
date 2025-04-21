import { TextInput, View } from 'react-native'

export const Task = ({ task: { id, title, state }, onArchiveTask, onPinTask }) => {
  return (
    <View>
      <TextInput value={state} editable={false} />
    </View>
  )
}
