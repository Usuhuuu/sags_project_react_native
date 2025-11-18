import { useTheme } from "@/app/(modals)/context/themeContext";
import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ImageBackground,
  TouchableOpacity,
} from "react-native";

const Team: React.FC = () => {
  const { colors: Colors } = useTheme();

  const team = [
    {
      id: 1,
      name: "Clan 1",
      members: 10,
      image: require("@/assets/images/zurag1.jpg"),
    },
    {
      id: 2,
      name: "Clan 2",
      members: 10,
      image: require("@/assets/images/zurag1.jpg"),
    },
    {
      id: 3,
      name: "Clan 3",
      members: 10,
      image: require("@/assets/images/zurag1.jpg"),
    },
    {
      id: 4,
      name: "Clan 4",
      members: 10,
      image: require("@/assets/images/zurag1.jpg"),
    },
    {
      id: 5,
      name: "Clan 5",
      members: 10,
      image: require("@/assets/images/zurag1.jpg"),
    },
  ];
  const FlatListRef = useRef<FlatList | null>(null);

  const renderItem = ({
    item,
  }: {
    item: { id: number; name: string; members: number; image: any };
  }) => (
    <TouchableOpacity style={styles.clanItem}>
      <View style={styles.imageContainer}>
        <ImageBackground source={item.image} style={styles.image} />
      </View>
      <Text style={styles.clanName}>{item.name}</Text>
      <Text style={styles.clanMembers}>Members: {item.members}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Teams</Text>
      <FlatList
        data={team}
        ref={(ref) => (FlatListRef.current = ref)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      />
      <TouchableOpacity
        style={{
          marginTop: 20,
          backgroundColor: Colors.primary,
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 5,
          elevation: 2,

          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        <Text style={styles.seeMoreText}>iluu ikhiig harah</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  clanItem: {
    alignItems: "center",
    marginRight: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    overflow: "hidden",
    width: 120, // Adjust as per your design
  },
  imageContainer: {
    width: "100%",
    height: 100, // Adjust height as needed
    backgroundColor: "#e5f0ff",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  clanName: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  clanMembers: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },

  seeMoreText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Team;
