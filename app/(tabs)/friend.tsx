import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { auth_swr } from "@/hooks/useswr";
import { useAuth } from "../(modals)/context/authContext";
import { Friend_Status, FriendSeparator } from "@/interfaces/friendType";
import { ActivityIndicator } from "react-native-paper";
import Colors from "@/constants/Colors";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import Friend_Separator from "../(modals)/friend/components/friendSeparator";
import Friend_Add_Modal from "../(modals)/friend/components/friend_add";

const FriendRequest = () => {
  const [friendSeparator, setFriendSeparator] = useState<FriendSeparator>(
    FriendSeparator.FRIENDS
  );
  const [friends, setFriends] = useState<Friend_Status>({} as Friend_Status);
  const [searchValue, setSearchValue] = useState<string>("");
  const [modalDisplay, setModalDisplay] = useState<boolean>(false);

  const { LoginStatus } = useAuth();
  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = auth_swr(
    {
      item: {
        pathname: "friends",
        cacheKey: "profile_friends",
        loginStatus: LoginStatus,
      },
    },
    {
      revalidateOnMount: true,
      revalidateOnReconnect: true,
    }
  );

  useEffect(() => {
    if (userError) {
      console.log("error on Friends");
    } else if (userData) {
      setFriends(userData.profileData);
    }
  }, [userData, userError]);

  return userLoading ? (
    <View style={friend_style.container}>
      <ActivityIndicator size={"large"} />
    </View>
  ) : (
    <View style={friend_style.container}>
      {/* Separator Section */}
      <View style={{ margin: 10 }}>
        <View style={friend_style.separator_container}>
          <TouchableOpacity
            style={[
              friend_style.separator_list,
              {
                backgroundColor:
                  friendSeparator === FriendSeparator.FRIENDS
                    ? Colors.white
                    : Colors.lightGrey,
              },
            ]}
            onPress={() => setFriendSeparator(FriendSeparator.FRIENDS)}
          >
            <Text
              style={{
                color:
                  FriendSeparator.FRIENDS === friendSeparator
                    ? Colors.dark
                    : Colors.darkGrey,
                fontSize: 14,
              }}
            >
              Friends
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              friend_style.separator_list,
              {
                backgroundColor:
                  friendSeparator === FriendSeparator.REQUESTS
                    ? Colors.white
                    : Colors.lightGrey,
              },
            ]}
            onPress={() => setFriendSeparator(FriendSeparator.REQUESTS)}
          >
            <Text
              style={{
                color:
                  FriendSeparator.REQUESTS === friendSeparator
                    ? Colors.dark
                    : Colors.darkGrey,
                fontSize: 14,
              }}
            >
              Friend Request
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              friend_style.separator_list,
              {
                backgroundColor:
                  friendSeparator === FriendSeparator.SENDED
                    ? Colors.white
                    : Colors.lightGrey,
              },
            ]}
            onPress={() => setFriendSeparator(FriendSeparator.SENDED)}
          >
            <Text
              style={{
                color:
                  FriendSeparator.SENDED === friendSeparator
                    ? Colors.dark
                    : Colors.darkGrey,

                fontSize: 14,
              }}
            >
              Sended
            </Text>
          </TouchableOpacity>
        </View>
        {/* Search and send Section */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            gap: "2%",
          }}
        >
          <View style={friend_style.searchContainer}>
            <FontAwesome
              name="search"
              size={18}
              color={Colors.littleDarkGrey}
            />
            <TouchableOpacity>
              <TextInput
                value={searchValue}
                onChangeText={(text) => setSearchValue(text)}
                placeholder={"Search"}
                placeholderTextColor={Colors.darkGrey}
              />
            </TouchableOpacity>
          </View>
          <View style={friend_style.searchSection_sendSection}>
            <TouchableOpacity onPress={() => setModalDisplay(!modalDisplay)}>
              <Ionicons
                name="person-add-outline"
                size={24}
                color={Colors.darkGrey}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View>
        <Friend_Separator data={friends} screen_type={friendSeparator} />
        <Friend_Add_Modal
          modalDisplay={modalDisplay}
          setModalDisplay={setModalDisplay}
        />
      </View>
    </View>
  );
};

export default FriendRequest;

const friend_style = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    width: "100%",
    height: "100%",
  },
  separator_container: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.lightGrey,
    padding: 2,
    width: "100%",
    gap: 5,
    borderRadius: 10,
  },
  separator_list: {
    width: "32%",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
  },
  searchContainer: {
    backgroundColor: Colors.lightGrey,
    padding: 10,
    marginTop: 5,
    flexDirection: "row",
    gap: 10,
    borderRadius: 10,
    width: "80%",
  },
  searchSection_sendSection: {
    width: "18%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.lightGrey,
    marginTop: 5,
    flexDirection: "row",
    borderRadius: 10,
  },
});
