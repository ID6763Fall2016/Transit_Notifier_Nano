#include <ESP8266HTTPClient.h>

#include <ArduinoJson.h>

/*
 *  Simple HTTP get webclient test
 */

#include <ESP8266WiFi.h>

//
//const char* ssid     = "GTother";
//const char* password = "GeorgeP@1927";
// Home WIFI
const char* ssid     = "ATT9Gz6Unk";
const char* password = "75h5286hc3fu";

const char* host = "chi01.xuleijr.com";
const int httpPort = 8080;
byte mac[6];                     // the MAC address of your Wifi shield

void setup() {
  Serial.begin(115200);
  delay(100);

  // We start by connecting to a WiFi network

  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

int value = 0;

void loop() {
  delay(5000);
  ++value;

  Serial.print("connecting to ");
  Serial.println(host);

  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  //print mac address
  WiFi.macAddress(mac);
  Serial.print("MAC: ");
  Serial.print(mac[0],HEX);
  Serial.print(":");
  Serial.print(mac[1],HEX);
  Serial.print(":");
  Serial.print(mac[2],HEX);
  Serial.print(":");
  Serial.print(mac[3],HEX);
  Serial.print(":");
  Serial.print(mac[4],HEX);
  Serial.print(":");
  Serial.println(mac[5],HEX);
  
  
  // Use WiFiClient class to create TCP connections
  WiFiClient client;
  if (!client.connect(host, httpPort)) {
    Serial.println("connection failed");
    return;
  }
  
  // We now create a URI for the request
  String url = "/api/suggest";
  Serial.print("Requesting URL: ");
  Serial.println(url);
  
  // This will send the request to the server
  client.print(String("GET ") + url + " HTTP/1.1\r\n" +
               "Host: " + host + "\r\n" + 
               "Connection: close\r\n\r\n");
  delay(500);
  
  if(0 < client.available()) {
    // Skipping headers
    while(client.available() && '{' != client.read()) {}
    int n = client.available() + 1;
    // Get and parse json
    if(n < 20480) {
      char *buf = new char[n + 1];
      *buf = '{';
      int rd = client.peekBytes((uint8_t *)buf + 1, n);
      buf[n] = 0;
      Serial.printf("%d bytes read: %s\n", rd, buf);
      StaticJsonBuffer<512> jsonBuffer;
      char *p = strstr(buf, "{");
      JsonObject& root = jsonBuffer.parseObject(p);
      int cn = root["clough"]["ahead"];
      Serial.printf("%d minutes ahead of TSRB till Clough\n", cn);
      delete []buf;
    } else {
      Serial.printf("JSON too huge: %d bytes\n", n);
    }
  }
  
  Serial.println();
  Serial.println("closing connection");
}

