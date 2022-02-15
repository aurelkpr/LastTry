import React, {useEffect} from 'react';
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import Clipboard from '@react-native-clipboard/clipboard';

import Modal from 'react-native-modal';
import * as Updates from 'expo-updates';

export default function App() {
  const [token, setToken] = React.useState('');

  async function getFcmToken() {
    console.log('Check tocken', messaging());
    let token;
    try {
      token = await messaging().getToken();
      console.log('Check tocken done');
    } catch (error) {
      //phones without google play services
      console.warn('Cannot get fcm token....', error);
    }
    return token;
  }

  useEffect(async () => {
    const hastPermissions = await messaging().requestPermission();
    const enabled =
      hastPermissions === messaging.AuthorizationStatus.AUTHORIZED ||
      hastPermissions === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const token = await getFcmToken();
      setToken(token);

      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('message arrived', remoteMessage);
        ToastAndroid.show('Updating....', ToastAndroid.SHORT);
        handleForceUpdate();
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage = {}) => {
      const notification = remoteMessage.notification || {};
      const title = notification.title;
      const body = notification.body;
      if (title) {
        ToastAndroid.show('Updating....', ToastAndroid.SHORT);
        handleForceUpdate();
      }
    });

    return unsubscribe;
  }, []);

  handleCheckUpdate = async () => {
    console.log(Updates);
    if (__DEV__) return;
    try {
      const status = await Updates.checkForUpdateAsync();
      if (status.isAvailable) {
        const message = `Has available updates: ${status.isAvailable} \nPublished: ${status.manifest.publishedTime}`;
        alert(message);
      } else {
        alert('No new updates');
      }
    } catch (error) {
      alert(JSON.stringify(error.message));
    }
  };

  handleForceUpdate = async () => {
    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
      alert('Update succeed');
    } catch (error) {
      alert(JSON.stringify(error.message));
    }
  };

  showAlert = () => {
    alert('Update succeed', 'OhetStuff');
  };
  return (
    <View style={styles.container}>
      <Text style={{fontSize: 20, fontWeight: 'bold'}}>
        Build: {__DEV__ ? 'Develop' : 'Prod'}
      </Text>
      <Text />
      <Button onPress={handleCheckUpdate} title="Check Update" />
      <Text />
      <Button onPress={handleForceUpdate} title="Force Update" />
      <Text />
      <Button title="copy token" onPress={() => Clipboard.setString(token)} />
      <Text style={{padding: 10, fontSize: 13}}>{token}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
