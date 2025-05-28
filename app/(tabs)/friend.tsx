import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { Image } from "react-native";
import { mutate } from "swr";
import Colors from "@/constants/Colors";
import axiosInstance from "../../hooks/axiosInstance";
import { useTranslation } from "react-i18next";
import { useAuth } from "../(modals)/context/authContext";
import { auth_swr, post_auth_swr } from "../../hooks/useswr";
import { Avatar, Searchbar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFriendStore } from "../(modals)/context/store/friendStore";
type FriendName = {
  firstName: string;
  lastName: string;
};
export type FriendProfileType = {
  unique_user_ID: string;
  email: string;
  userImage?: string;
  userNames?: FriendName;
};

const FriendRequest = () => {
  const [friendData, setFriendData] = useState<string[]>([]);
  const [userRequestData, setUserRequestData] = useState<string[]>([]);
  const [sendRequests, setSendRequests] = useState<string[]>([]);
  const [friendShow, setFriendShow] = useState<
    "Friend" | "Friend Request" | "Send Request"
  >("Friend Request");
  const [friendInfo, setFriendInfo] = useState<FriendProfileType[]>([]);
  const [entireFriendData, setEntireFriendData] = useState<any>(null);
  const [showFriends, setShowFriends] = useState<boolean>(false);
  const [noFriend, setNoFriend] = useState<boolean>(false);

  const [isitLoading, setIsitLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { t } = useTranslation();
  const { LoginStatus } = useAuth();

  const options: ("Friend" | "Friend Request" | "Send Request")[] = [
    "Friend",
    "Friend Request",
    "Send Request",
  ];

  const currentData =
    friendShow === "Friend"
      ? friendData
      : friendShow === "Friend Request"
      ? userRequestData
      : sendRequests;

  const { data, error, isLoading } = auth_swr(
    {
      item: {
        pathname: "friends",
        cacheKey: "User_Friend",
        loginStatus: LoginStatus,
      },
    },
    {
      revalidateOnMount: true,
      refreshInterval: 60 * 1000,
    }
  );

  const {
    data: userInfoData,
    error: userInfoError,
    isLoading: userInfoLoading,
  } = post_auth_swr(
    {
      item: {
        pathname: "/auth/friend_data",
        cacheKey: "friend_profile_info",
        loginStatus: LoginStatus && entireFriendData?.length > 0,
        body: entireFriendData,
      },
    },
    {
      revalidateOnFocus: true,
      revalidateOnMount: true,
      dedupingInterval: 10000,
    }
  );

  useEffect(() => {
    if (data) {
      // Check if profileData exists and is a valid JSON string
      let profileData: {
        friends: string[];
        recieved_requests: string[];
        send_requests?: string[];
      } = { friends: [], recieved_requests: [] };
      if (
        typeof data.profileData === "string" &&
        data.profileData.trim() !== ""
      ) {
        try {
          profileData = JSON.parse(data.profileData);
          if (
            profileData.friends.length === 0 &&
            profileData.recieved_requests.length === 0 &&
            profileData.send_requests?.length === 0
          ) {
            setNoFriend(true);
          }
        } catch (err) {
          console.error("Error parsing profileData:", err);
        }
      }
      setFriendData(profileData.friends || []);
      setUserRequestData(profileData.recieved_requests || []);
      setSendRequests(profileData.send_requests || []);
      const allValues: string[] = [
        ...(profileData.friends || []),
        ...(profileData.recieved_requests || []),
        ...(profileData.send_requests || []),
      ];
      setEntireFriendData(allValues);
    } else if (error) {
      console.log("Error fetching user friend data:", error);
    }
    setIsitLoading(isLoading);
  }, [data, error, isLoading]);

  useEffect(() => {
    if (userInfoLoading) {
      setShowFriends(false);
    }
    if (userInfoData) {
      setFriendInfo(userInfoData.friendData || []);
      setShowFriends(!showFriends);
    } else if (userInfoError) {
      setFriendInfo([]);
      setShowFriends(true);
    }
    setShowFriends(true);
    !LoginStatus && setNoFriend(true);
  }, [userInfoData, userInfoError, userInfoLoading, data, error]);

  const uniqueCurrentData = Array.from(new Set(currentData));

  const handleAccept = async (friend_ID: string) => {
    try {
      const response = await axiosInstance.post("/auth/friend_accept", {
        friend_unique_ID: friend_ID,
      });
      if (response.status == 200) {
        mutate(["User_Friend", LoginStatus], undefined, { revalidate: true });
        mutate(["friend_profile_info", LoginStatus], undefined, {
          revalidate: true,
        });
        Alert.alert("Success", "Friend request accepted");
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleCancel = async (friend_ID: string) => {
    try {
      const response = await axiosInstance.post("/auth/friend_cancel", {
        friend_unique_ID: friend_ID,
      });
      if (response.status == 200) {
        mutate(["User_Friend", LoginStatus], undefined, { revalidate: true });
        mutate(["friend_profile_info", LoginStatus], undefined, {
          revalidate: true,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleRequestSend = async () => {
    try {
      const enterMessageLength = searchQuery.length;
      if (enterMessageLength < 1) {
        Alert.alert("Error", "Please enter a valid ID");
        return;
      }

      const response = await axiosInstance.post("/auth/friend_request", {
        friend_unique_ID: searchQuery,
      });
      if (response.status === 200) {
        mutate(["User_Friend", LoginStatus], undefined, { revalidate: true });
        mutate(["friend_profile_info", LoginStatus], undefined, {
          revalidate: true,
        });

        Alert.alert("Success", "Friend request sent");
      } else if (response.status === 400) {
        if (response.data.find) {
          Alert.alert("Error", "Request already sent");
        } else {
          Alert.alert("Error", "User not found");
        }
      }
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 400) {
          Alert.alert("Error", err.response.data.message || "Bad Request");
        } else {
          Alert.alert("Error", "Something went wrong. Please try again.");
        }
      } else {
        console.log("Error without response:", err);
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    }
  };

  const handleVisit = (item: string) => {
    console.log(item);
    const passData = friendInfo.filter(
      (friend) => friend.unique_user_ID === item
    );

    useFriendStore.getState().setFriendDetails(passData[0]);
    router.push(`/(modals)/user/${item}`);
  };

  return (
    <View style={{ backgroundColor: Colors.lightGrey, flex: 1 }}>
      {noFriend ? (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Image
              source={require("@/assets/images/profileIcons/no_friend_image.png")}
              style={{ width: 300, height: 400 }}
              resizeMode="contain"
            />
            <Text style={{ fontWeight: "bold", fontSize: 30 }}>
              No friend requests yet.
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 300,
                color: Colors.darkGrey,
              }}
            >
              Want to meet new friends?
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 300,
                color: Colors.darkGrey,
              }}
            >
              Start discovering players nearby.
            </Text>
          </View>
        </View>
      ) : (
        <>
          {isitLoading ? (
            <ActivityIndicator size="large" color={Colors.primary} />
          ) : (
            <View
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              {showFriends ? (
                <View style={style.subContainer}>
                  <Searchbar
                    mode="bar"
                    placeholder="Search & Add Friends"
                    value={searchQuery}
                    onChangeText={(text) => setSearchQuery(text)}
                    style={{
                      width: "100%",
                      backgroundColor: Colors.white,
                      borderRadius: 10,
                      borderBottomColor: Colors.white,
                      marginTop: 10,
                    }}
                    placeholderTextColor={Colors.darkGrey}
                    right={() => (
                      <TouchableOpacity onPress={() => handleRequestSend()}>
                        <Text>sda</Text>
                      </TouchableOpacity>
                    )}
                  />

                  <View style={style.allFriendContainer}>
                    <View style={style.friendContainer}>
                      {options.map((label) => (
                        <TouchableOpacity
                          key={label}
                          style={[
                            style.innerFriend,
                            {
                              backgroundColor:
                                friendShow === label
                                  ? Colors.secondary
                                  : Colors.white,
                            },
                          ]}
                          onPress={() => {
                            setFriendShow(label);
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              color:
                                friendShow === label
                                  ? Colors.white
                                  : Colors.darkGrey,
                              writingDirection: "ltr",
                            }}
                          >
                            {label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={style.outFriendContainer}>
                    {currentData === userRequestData &&
                      uniqueCurrentData.length === 0 && (
                        <View style={{ padding: 10, alignItems: "center" }}>
                          <Text
                            style={{ fontSize: 16, color: Colors.darkGrey }}
                          >
                            No friend requests yet.
                          </Text>
                        </View>
                      )}

                    {currentData === friendData &&
                      uniqueCurrentData.length === 0 && (
                        <View style={{ padding: 10, alignItems: "center" }}>
                          <Text
                            style={{ fontSize: 16, color: Colors.darkGrey }}
                          >
                            You don’t have any friends yet.
                          </Text>
                        </View>
                      )}
                    {currentData === sendRequests &&
                      uniqueCurrentData.length === 0 && (
                        <View style={{ padding: 10, alignItems: "center" }}>
                          <Text
                            style={{ fontSize: 16, color: Colors.darkGrey }}
                          >
                            No send request yet.
                          </Text>
                        </View>
                      )}
                    <FlatList
                      data={uniqueCurrentData}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => {
                        const matchedFriend = friendInfo?.find(
                          (friend) => friend.unique_user_ID === item
                        );
                        return (
                          <View
                            style={{
                              backgroundColor: Colors.grey,
                              marginHorizontal: 20,
                              padding: 15,
                              borderRadius: 10,
                              marginTop: 10,
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            {matchedFriend && (
                              <View
                                style={{
                                  flexDirection: "row",
                                }}
                              >
                                <Avatar.Image
                                  source={{ uri: matchedFriend.userImage }}
                                  size={60}
                                  style={{
                                    backgroundColor: Colors.primary,
                                  }}
                                />
                                <View
                                  style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      color: Colors.dark,
                                      fontWeight: "bold",
                                      alignSelf: "flex-start",
                                    }}
                                  >
                                    {item.charAt(0).toUpperCase() +
                                      item.slice(1)}
                                  </Text>
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      color: Colors.darkGrey,
                                    }}
                                  >
                                    {matchedFriend.email}
                                  </Text>
                                </View>
                              </View>
                            )}
                            {currentData === userRequestData && (
                              <View
                                style={{
                                  flexDirection: "column",
                                }}
                              >
                                <TouchableOpacity
                                  style={{
                                    backgroundColor: Colors.secondary,
                                    borderRadius: 10,
                                    padding: 10,
                                    width: 90,
                                    alignItems: "center",
                                  }}
                                  onPress={() => handleAccept(item)}
                                >
                                  <Text
                                    style={{
                                      color: Colors.white,
                                      fontSize: 17,
                                    }}
                                  >
                                    Accept
                                  </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={{
                                    borderRadius: 10,
                                    width: 90,
                                    alignItems: "center",
                                  }}
                                  onPress={() => handleCancel(item)}
                                >
                                  <Text
                                    style={{
                                      color: Colors.darkGrey,
                                      fontSize: 17,
                                    }}
                                  >
                                    Cancel
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            )}
                            {currentData === friendData && (
                              <View style={{ flexDirection: "row", gap: 5 }}>
                                <TouchableOpacity
                                  onPress={() =>
                                    router.push(`/(modals)/chat/${item}`)
                                  }
                                >
                                  <Ionicons
                                    name="chatbubble-sharp"
                                    size={25}
                                    color={Colors.primary}
                                  />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() => {
                                    console.log(item);
                                    handleVisit(item);
                                  }}
                                >
                                  <Ionicons
                                    name="person-circle-outline"
                                    size={25}
                                    color={Colors.primary}
                                  />
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        );
                      }}
                    />
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  <ActivityIndicator size={"large"} color={Colors.primary} />
                </View>
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
};

const style = StyleSheet.create({
  subContainer: {
    backgroundColor: Colors.lightGrey,
    marginHorizontal: 10,
    flex: 1,
  },
  allFriendContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    height: 50,
    backgroundColor: Colors.dark,
  },
  friendContainer: {
    flexDirection: "row",
    width: "100%",
    marginTop: 10,
    height: 70,
    borderRadius: 10,
  },
  innerFriend: {
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    padding: 15,
    width: "33.3%",
  },
  outFriendContainer: {
    width: "100%",
    height: "70%",
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginTop: 20,
  },
});
export default FriendRequest;
