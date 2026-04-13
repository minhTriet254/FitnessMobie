import { Stack } from "expo-router";

export default function CourseLayout() {
  return (
    <Stack>
        <Stack.Screen 
          name="[id]" 
          options={{ title: "Chi tiết khóa học" }} 
        />
        <Stack.Screen 
          name="lesson/[id]" 
          options={{ title: "Bài học" }} 
        /> 
        <Stack.Screen 
          name="lesson/video/[id]" 
          options={{ title: "Video hướng dẫn" }} 
        /> 
    </Stack>
    
  );
}