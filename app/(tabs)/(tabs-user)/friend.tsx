import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/(modals)/context/authContext";
import { Friend_Status, FriendSeparator } from "@/interfaces/friendType";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import Friend_Separator from "@/app/(modals)/friend/components/friendSeparator";
import Friend_Add_Modal from "@/app/(modals)/friend/components/friend_add";
import { useTheme } from "@/app/(modals)/context/themeContext";
import { useRegularQuery } from "@/hooks/useQuery";
import OwnActivaterIndicator from "@/constants/loaderAnimation";
import { useFocusEffect } from "expo-router";
import { connectSocket } from "@/hooks/socketConnection";
import { Socket } from "socket.io-client";
import { useIsFocused } from "@react-navigation/native";

const FriendRequest = () => {
  const { colors: Colors } = useTheme();

  const [page, setPage] = useState<Record<FriendSeparator, number>>({
    [FriendSeparator.FRIENDS]: 1,
    [FriendSeparator.REQUESTS]: 1,
    [FriendSeparator.SENDED]: 1,
  });
  const [friendSeparator, setFriendSeparator] = useState<FriendSeparator>(
    FriendSeparator.FRIENDS,
  );
  const [hasMore, setHasMore] = useState<Record<FriendSeparator, boolean>>({
    [FriendSeparator.FRIENDS]: true,
    [FriendSeparator.REQUESTS]: true,
    [FriendSeparator.SENDED]: true,
  });

  const [friends, setFriends] = useState<Friend_Status>({} as Friend_Status);
  const [searchValue, setSearchValue] = useState<string>("");
  const [modalDisplay, setModalDisplay] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);
  const loadingMoreRef = useRef(false);

  const { LoginStatus } = useAuth();
  const isFocused = useIsFocused();

  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = useRegularQuery(
    {
      pathname: `/auth/friend/${friendSeparator}/${page[friendSeparator]}`,
      cacheKey: [
        "auth_friend",
        friendSeparator,
        page[friendSeparator],
      ] as const,
      loginStatus: LoginStatus,
    },
    {
      enabled: LoginStatus && isFocused,
      refetchOnMount: false,
      retry: 3,
    },
  );

  useEffect(() => {
    if (userError) {
      console.log("error on Friends");
    } else if (userData) {
      const data = userData?.result;
      const dataMap: Record<FriendSeparator, keyof Friend_Status> = {
        [FriendSeparator.FRIENDS]: "friends",
        [FriendSeparator.REQUESTS]: "recieved_requests",
        [FriendSeparator.SENDED]: "sended_requests",
      };
      setFriends((prev) => {
        const key = dataMap[friendSeparator];
        console.log(key);

        const currentList = prev[key] ?? [];
        console.log(currentList);

        const seen = new Set(currentList.map((f: any) => f.unique_user_ID));

        const unique = (data[key] ?? []).filter((item: any) => {
          if (seen.has(item.unique_user_ID)) return false;
          seen.add(item.unique_user_ID);
          return true;
        });

        return {
          ...prev,
          [key]: [...currentList, ...unique],
        };
      });
      if (data.length > 9) {
        setHasMore((prev) => ({ ...prev, [friendSeparator]: false }));
      }
      console.log(data.length);
    }
  }, [userData, userError]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const handleFriendRequest = (data: any) => {
        console.log(data);
      };

      const initSocket = async () => {
        const socket = await connectSocket();

        if (!socket || !active) return;

        socketRef.current = socket;

        socket.on("friend_request_recieved", handleFriendRequest);
      };

      initSocket();

      return () => {
        active = false;

        if (socketRef.current) {
          socketRef.current.off("friend_request_recieved", handleFriendRequest);
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }, []),
  );
  const fetchMore = useCallback(() => {
    if (loadingMoreRef.current || userLoading || !hasMore[friendSeparator]) {
      return;
    }
    loadingMoreRef.current = true;
    setPage((prev) => ({
      ...prev,
      [friendSeparator]: prev[friendSeparator] + 1,
    }));
  }, [hasMore]);

  if (userLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
        <OwnActivaterIndicator />
      </View>
    );
  }
  return (
    <View
      style={{
        backgroundColor: Colors.backgroundColor,
        width: "100%",
        height: "100%",
      }}
    >
      {/* Separator Section */}
      <View style={{ margin: 10 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            backgroundColor: Colors.containerColor,
            padding: 2,
            width: "100%",
            gap: 5,
            borderRadius: 10,
          }}
        >
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
          <View
            style={{
              backgroundColor: Colors.containerColor,
              padding: 10,
              marginTop: 5,
              flexDirection: "row",
              gap: 10,
              borderRadius: 10,
              width: "80%",
            }}
          >
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
          <View
            style={{
              width: "18%",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: Colors.containerColor,
              marginTop: 5,
              flexDirection: "row",
              borderRadius: 10,
            }}
          >
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
      <View style={{}}>
        <Friend_Separator
          data={friends}
          screen_type={friendSeparator}
          loading={userLoading}
          fetchMore={fetchMore}
        />
        {modalDisplay && (
          <Friend_Add_Modal
            modalDisplay={modalDisplay}
            setModalDisplay={setModalDisplay}
            socket={socketRef}
          />
        )}
      </View>
    </View>
  );
};

const friend_style = StyleSheet.create({
  separator_list: {
    width: "32%",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
  },
});

export default FriendRequest;
