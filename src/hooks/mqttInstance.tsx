import mqtt, { type MqttClient } from "mqtt";

class MQTTService {
  private client: MqttClient | null = null;

  private brokerUrl = process.env.EXPO_PUBLIC_MQTT_BROKER_URL!;
  private username = process.env.EXPO_PUBLIC_MQTT_USERNAME;
  private password = process.env.EXPO_PUBLIC_MQTT_PASSWORD;

  connect() {
    // Already connected / connecting
    if (this.client) {
      console.log("⚠️ MQTT already initialized");
      return this.client;
    }

    this.client = mqtt.connect(this.brokerUrl, {
      username: this.username,
      password: this.password,
      reconnectPeriod: 5000,
      clean: true,
    });

    this.client.on("connect", () => {
      console.log("✅ MQTT connected");

      this.subscribe("hall/updated");
    });

    this.client.on("message", (topic, message) => {
      console.log("📩 MQTT message:", {
        topic,
        message: message.toString(),
      });
    });

    this.client.on("error", (error) => {
      console.error("❌ MQTT error:", error);
    });

    this.client.on("reconnect", () => {
      console.log("🔄 MQTT reconnecting...");
    });

    this.client.on("close", () => {
      console.log("🔌 MQTT disconnected");
    });

    return this.client;
  }

  subscribe(topic: string) {
    if (!this.client) {
      console.error("❌ MQTT client not initialized");
      return;
    }

    this.client.subscribe(topic, (error, granted) => {
      if (error) {
        console.error("❌ Subscribe failed:", error);
        return;
      }

      console.log("✅ Subscribed:", granted);
    });
  }

  publish(topic: string, message: unknown) {
    if (!this.client) {
      console.error("❌ MQTT client not initialized");
      return;
    }

    this.client.publish(topic, JSON.stringify(message));
  }

  disconnect() {
    if (!this.client) return;

    this.client.end();
    this.client = null;

    console.log("🛑 MQTT stopped");
  }

  isConnected() {
    return this.client?.connected ?? false;
  }
}

export const mqttService = new MQTTService();
