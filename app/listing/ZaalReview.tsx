import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Review {
  id: string;
  rating: number;
  comment: string;
  user: string;
}

const SportHallReviewPage = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: "1",
      rating: 4,
      comment: "Good sport hall",
      user: "Anujin",
    },
    {
      id: "2",
      rating: 5,
      comment: "its quite cheap and good",
      user: "Dashka",
    },
  ]);

  const handleSubmit = () => {
    if (rating === 0 || comment.trim() === "") return;
    const newReview: Review = {
      id: Date.now().toString(),
      rating,
      comment,
      user: "You",
    };
    setReviews([newReview, ...reviews]);
    setComment("");
    setRating(0);
  };

  const renderStars = (count: number, onPress?: (i: number) => void) => {
    return [...Array(5)].map((_, i) => (
      <TouchableOpacity key={i} onPress={() => onPress?.(i + 1)}>
        <Ionicons
          name={i < count ? "star" : "star-outline"}
          size={24}
          color="orange"
        />
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leave a Review</Text>
      <View style={styles.stars}>{renderStars(rating, setRating)}</View>
      <TextInput
        style={styles.input}
        placeholder="Write your comment"
        value={comment}
        onChangeText={setComment}
        multiline
      />
      <Button title="Submit Review" onPress={handleSubmit} />

      <Text style={styles.title}>All Reviews</Text>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.review}>
            <Text style={styles.user}>{item.user}</Text>
            <View style={styles.stars}>{renderStars(item.rating)}</View>
            <Text>{item.comment}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default SportHallReviewPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  stars: {
    flexDirection: "row",
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    minHeight: 60,
    textAlignVertical: "top",
  },
  review: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 10,
  },
  user: {
    fontWeight: "bold",
  },
});
