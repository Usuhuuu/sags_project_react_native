import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "../(modals)/context/authContext";
import { Friend_Status, FriendSeparator } from "@/interfaces/friendType";
import { ActivityIndicator } from "react-native-paper";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import Friend_Separator from "../(modals)/friend/components/friendSeparator";
import Friend_Add_Modal from "../(modals)/friend/components/friend_add";
import { useTheme } from "../(modals)/context/themeContext";
import { useAuthQuery } from "@/hooks/useQuery";
import OwnActivaterIndicator from "@/constants/loaderAnimation";

const FriendRequest = () => {
  const { colors: Colors } = useTheme();
  const friend_style = StyleSheet.create({
    container: {
      backgroundColor: Colors.backgroundColor,
      width: "100%",
      height: "100%",
    },
    separator_container: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: Colors.containerColor,
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
      backgroundColor: Colors.containerColor,
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
      backgroundColor: Colors.containerColor,
      marginTop: 5,
      flexDirection: "row",
      borderRadius: 10,
    },
  });
  const [friendSeparator, setFriendSeparator] = useState<FriendSeparator>(
    FriendSeparator.FRIENDS,
  );
  const [friends, setFriends] = useState<Friend_Status>({} as Friend_Status);
  const [searchValue, setSearchValue] = useState<string>("");
  const [modalDisplay, setModalDisplay] = useState<boolean>(false);

  const { LoginStatus } = useAuth();

  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = useAuthQuery(
    {
      pathname: "friends",
      cacheKey: ["auth_friend"] as const,
      loginStatus: LoginStatus,
    },
    {
      enabled: LoginStatus,
      staleTime: 1_000,
      retry: 3,
    },
  );

  useEffect(() => {
    if (userError) {
      console.log("error on Friends");
    } else if (userData) {
      setFriends(userData.profileData);
    }
  }, [userData, userError]);

  if (userLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
        <OwnActivaterIndicator />
      </View>
    );
  }

  return (
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
                    ? Colors.primary
                    : Colors.containerColor,
              },
            ]}
            onPress={() => setFriendSeparator(FriendSeparator.FRIENDS)}
          >
            <Text
              style={{
                color:
                  FriendSeparator.FRIENDS === friendSeparator
                    ? Colors.white
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
                    ? Colors.primary
                    : Colors.containerColor,
              },
            ]}
            onPress={() => setFriendSeparator(FriendSeparator.REQUESTS)}
          >
            <Text
              style={{
                color:
                  FriendSeparator.REQUESTS === friendSeparator
                    ? Colors.white
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
                    ? Colors.primary
                    : Colors.containerColor,
              },
            ]}
            onPress={() => setFriendSeparator(FriendSeparator.SENDED)}
          >
            <Text
              style={{
                color:
                  FriendSeparator.SENDED === friendSeparator
                    ? Colors.white
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
            <FontAwesome name="search" size={18} color={Colors.darkGrey} />
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
