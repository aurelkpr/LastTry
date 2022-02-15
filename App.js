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

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';

import Clipboard from '@react-native-clipboard/clipboard';

import {
  initializeProvider,
  loginWithProvider,
  getDocWithProvider,
  getData,
  initialize,
} from 'cross-platform';

import Modal from 'react-native-modal';
import * as Updates from 'expo-updates';

// const firebaseConfig = {
//   apiKey: 'AIzaSyBWErgtU4ymTHSs-Ei2jlrykfJBuUto3cY',
//   authDomain: 'cross-platform-b9fdc.firebaseapp.com',
//   projectId: 'cross-platform-b9fdc',
//   storageBucket: 'cross-platform-b9fdc.appspot.com',
//   messagingSenderId: '360442866391',
//   appId: '1:360442866391:web:ffa18230301935f8369e92',
//   measurementId: 'G-GDG2EXYYZL',
// };

// initialize(firebaseConfig);

export default function App() {
  const [initializing, setInitializing] = React.useState(true);
  const [token, setToken] = React.useState('');
  const [user, setUser] = React.useState('NA');

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

  useEffect(() => {
    initializeProvider({
      auth: auth(),
      firestore: firestore(),
    });
  }, []);

  // useEffect(async () => {
  //   try {
  //     console.log('Try login');
  //     const res = await auth().createUserWithEmailAndPassword(
  //       'alex_profir@yahoo.com',
  //       '12345678',
  //     );
  //     console(res.user);
  //     // setUser(res.user);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }, []);

  async function login() {
    try {
      console.log('Try login');
      const res = await loginWithProvider('alex_profir@yahoo.com', '12345678');
      console.log(res.user);
      setUser(res.user);
    } catch (e) {
      console.log(e);
    }
  }

  async function dataStore() {
    try {
      await firestore().enableNetwork();
      const user = await firestore()
        .collection('test')
        .doc('gSFXb239behYxvRiuVqI')
        .get();

      // const data = firestore().doc('test/gSFXb239behYxvRiuVqI');
      // const data = await getDocWithProvider('test/gSFXb239behYxvRiuVqI');
      console.log('++++++++++');
      console.log(user);
    } catch (e) {
      console.log('=====', e);
    }
  }

  useEffect(async () => {
    if (user) {
      const data = firestore().doc('test/gSFXb239behYxvRiuVqI');
      // const data = await getDocWithProvider('test/gSFXb239behYxvRiuVqI');
      console.log((await data.get()).data());
      // const unsub = data.onChange(doc => {
      //   console.log('change');
      //   console.log(doc.data());
      //   console.log({doc});
      // });
    }
  }, []);
  // Handle user state changes
  function onAuthStateChanged(user) {
    console.log('User changed', user);
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

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
      <Text>{JSON.stringify(user)}</Text>
      <Text />
      <Button onPress={handleCheckUpdate} title="Check Update" />
      <Text />
      <Button onPress={handleForceUpdate} title="Force Update" />
      <Text />
      <Button title="copy token" onPress={() => Clipboard.setString(token)} />
      <Text style={{padding: 10, fontSize: 13}}>{token}</Text>

      <Text />
      <Button onPress={() => login()} title="Login" />

      <Text />
      <Button onPress={() => dataStore()} title="Store" />
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
