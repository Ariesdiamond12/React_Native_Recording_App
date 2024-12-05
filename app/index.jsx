import {
  View,
  TextInput,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";
import { Link } from "expo-router";
import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function App() {
  const [recording, setRecording] = useState(null);
  const [audioSource, setAudioSource] = useState(null);
  const [recordingsList, setRecordingsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

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
        setRecordingsList((prevList) => [
          ...prevList,
          { id: Date.now().toString(), uri },
        ]); // Add new recording to list
        Alert.alert("Recording stopped", `Saved at: ${uri}`);
      }
    } catch (error) {
      console.error("Failed to stop recording", error);
    }
  };

  const playAudio = async (uri) => {
    try {
      const sound = new Audio.Sound();
      await sound.loadAsync({ uri });
      await sound.playAsync();
    } catch (error) {
      console.error("Failed to play audio", error);
    }
  };

  const deleteRecording = (id) => {
    setRecordingsList((prevList) => prevList.filter((item) => item.id !== id));
    Alert.alert("Recording deleted");
  };

  return (
    <View className="flex-1 items-center justify-start bg-gray-100 p-5">
      <View className="flex-row justify-center items-center space-x-4 mt-10">
        {/* Search Bar */}
        <TextInput
          placeholder="Search"
          className="flex-1 text-gray-600 px-5 py-3 border-gray-200 rounded-full"
          clearButtonMode="always"
          value={searchQuery}
          onChange={(query) => handleSearch(query)}
        />
        {/* Start/Stop Recording Button */}
        <TouchableOpacity
          onPress={recording ? stopRecording : startRecording}
          className="bg-blue-500 p-6 rounded-full"
        >
          <FontAwesome6
            name={recording ? "stop-circle" : "microphone"}
            size={40}
            color="white"
          />
        </TouchableOpacity>

        {/* Play Last Recording Button */}
        <TouchableOpacity
          onPress={() => audioSource && playAudio(audioSource)}
          className="bg-green-500 p-6 rounded-full"
        >
          <AntDesign name="play" size={40} color="white" />
        </TouchableOpacity>
      </View>

      {/* <Link className="mt-5 text-blue-500 text-lg" href="/profile">
        Go To Profile
      </Link> */}

      {/* List of Recordings */}
      <FlatList
        data={recordingsList}
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-lg shadow-md mt-5 flex-row justify-between items-center">
            <Text className="text-lg font-semibold">{`Recording ${item.id}`}</Text>
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => playAudio(item.uri)}
                className="bg-blue-500 p-2 rounded-full"
              >
                <AntDesign name="play" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteRecording(item.id)}
                className="bg-red-500 p-2 rounded-full"
              >
                <AntDesign name="delete" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 20, width: "100%" }}
      />
    </View>
  );
}
