import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Pressable, Text, Image, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {NavigationContainer, StackActions} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import base64 from 'react-native-base64';

const Stack = createNativeStackNavigator();
const host = 'https://nscc-0304263-wordpress-photos.azurewebsites.net';
const username = 'W0304263';
const password = 'YaKZ 4vvb Zlkx tpMj uDQt zBIg'; // api token

function HomeScreen( { navigation } ){

  const url = "https://nscc-0304263-wordpress-photos.azurewebsites.net/wp-json/wp/v2/posts?_fields=id,title,_links&_embed=author,wp:featuredmedia";

  const [posts, setPosts] = useState([]);

  const getPosts = async () => {
    const result = await fetch(url);
    const data = await result.json();
    setPosts(data);
  }

  if(posts.length === 0) {
    getPosts();
  }

  return (
    <View style={styles.container}>
      <Pressable style={ styles.button} onPress= { () => navigation.navigate('Create')} >
        <Text style={ styles.buttonText }>Add New Photo</Text>
      </Pressable>

      <ScrollView style={ marginTop=25 }>
        {posts.map(post => (
          <View key={post.id} style={marginBottom=10}>
            {post._embedded['wp:featuredmedia'] && <Image source={{ uri: host + post._embedded['wp:featuredmedia'][0].source_url }} style={{ width: 250, height: 250 }}></Image> }
            <Text>{ post.title.rendered }</Text>
          </View>
        ))}
      </ScrollView> 
      
    </View>
  );
}

function CreateScreen({ navigation }){
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  // Upload Featured Image to WordPress
  const uploadPhoto = async () => {
    const endPoint = host + '/wp-json/wp/v2/media';
    const fileName = image.split('/').pop();
    const formData = new FormData();
    const fileType = image.type || 'image/jpeg';

    formData.append('file', { 
      uri: image,
      type: fileType, // Android needs this
      name: fileName
    });

    const result = await fetch(endPoint, {
      method: 'POST',
      headers: {        
        'Content-disposition': 'formdata; filename=' + fileName,
        'Authorization': 'Basic ' + base64.encode(username + ':' + password)
      },
      body: formData
    });

    const response = await result.json();
    const mediaId = response.id;
    
    return mediaId;
  }

  // Create Post in WordPress
  const submitPost = async () => {
    
    // Validate inputs
    if(!title || !image){
      alert('Please complete all input fields.');
    }
    else {

      setIsLoading(true);

      // Create media Api
      const mediaId = await uploadPhoto();
      console.log('Media ID: ' + mediaId);

      // Create Post Api
      const endPoint = host + '/wp-json/wp/v2/posts';
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('status', 'publish');
      formData.append('featured_media', mediaId);

      // Create the post
      const result = await fetch(endPoint, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + base64.encode(username + ':' + password)
        },
        body: formData
      });

      const response = await result.json();

      if(response.id) {
        navigation.navigate('Home');
      }
      else {
        alert('Opps, something went wrong.');
      }

      setIsLoading(false);      
    }
  }
  
  return (
    <ScrollView>
      <View style={styles.container}>
        <TextInput 
          style={ styles.input } 
          placeholder="Title"
          onChangeText={ text => setTitle(text) } 
          defaultValue= { title } />

        <Pressable onPress={ pickImage } style={ styles.button }>
          <Text style={ styles.buttonText }>Choose Image</Text>
        </Pressable>

        { image && <Image source={{ uri: image }} style={{ width:250, height: 250, resizeMode: 'cover' }} /> }

        <Pressable onPress={ submitPost }  style={ styles.button }>
          <Text style={ styles.buttonText }>Submit</Text>
        </Pressable>
        
        { isLoading && <ActivityIndicator /> }
      </View>
    </ScrollView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Home' component={ HomeScreen } options={{ title: 'Resplash Mobile'}} />
        <Stack.Screen name='Create' component={ CreateScreen } options={{ title: 'Add New Photo'}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 10
    
  },
  input: {
    height: 40,
    marginBottom: 10,
    borderWidth: 1,
    padding: 10,
    width: 300,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'slateblue',
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: 0.25,
    color: 'white',
  }
});
