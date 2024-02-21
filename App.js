import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {NavigationContainer, StackActions} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function HomeScreen( { navigation } ){
  const [image, setImage] = useState(null);

  // Function to choose photo on phone
  const pickImage = async () => {

    // Pick photo on phone using expo-image-picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4,3],
      quality: 1
    });

    if(!result.canceled){
      const uri = result.assets[0].uri;

      setImage(uri);
    }

  }

  return (
    <View style={styles.container}>
      <Text>Food Label Reader</Text>
      <Button title="Choose an Image" onPress={ pickImage }></Button>
      { image && <Image source={{ uri: image }} style={{ width:250, height: 250, resizeMode: 'cover' }} /> }
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Home' component={ HomeScreen } options={{ title: 'Food Label Reader'}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
