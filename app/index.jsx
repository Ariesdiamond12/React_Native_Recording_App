import { View, Button, Alert } from "react-native";
import { Link } from "expo-router";
import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function App() {
  const [recording, setRecording] = useState(null);
  const [audioSource, setAudioSource] = useState(null);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    (async () => {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert("Permission to access microphone denied");
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      const recordingInstance = new Audio.Recording();
      await recordingInstance.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recordingInstance.startAsync();
      setRecording(recordingInstance);
      Alert.alert("Recording started");
    } catch (error) {
      console.error("Failed to start recording", error);
    }
  };

  const stopRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setAudioSource(uri);
        setRecording(null);
        Alert.alert("Recording stopped", `Saved at: ${uri}`);
      }
    } catch (error) {
      console.error("Failed to stop recording", error);
    }
  };

  const playAudio = async () => {
    try {
      if (audioSource) {
        const sound = new Audio.Sound();
        await sound.loadAsync({ uri: audioSource });
        await sound.playAsync();
        setPlayer(sound);
      } else {
        Alert.alert("No audio to play");
      }
    } catch (error) {
      console.error("Failed to play audio", error);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">


      <FontAwesome6
        name="microphone"
        size={30}
        color="white"
        style={{ padding: 35 }}
        className="rounded-full bg-blue-500"
        title={recording ? "Stop Recording" : "Start Recording"}
        onPress={recording ? stopRecording : startRecording}
      />

      <AntDesign
        name="play"
        size={30}
        color="white"
        style={{ padding: 35 }}
        className="rounded-full bg-blue-500"
        title="Play Sound"
        onPress={playAudio}
      />

      <Link className="text-blue-500" href="/profile">
        Go To Profile
      </Link>
    </View>
  );
}
