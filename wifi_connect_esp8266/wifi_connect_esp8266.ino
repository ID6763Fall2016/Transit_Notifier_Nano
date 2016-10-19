#define DEBUG_ESP_HTTP_CLIENT
#define DEBUG_ESP_PORT Serial

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

#include <Adafruit_DotStar.h>
#include <SPI.h>

#define NUMPIXELS 74
#define DATAPIN    4
#define CLOCKPIN   5

#define CLOUGH 1
#define KLAUS 0

Adafruit_DotStar strip = Adafruit_DotStar(
  NUMPIXELS, DATAPIN, CLOCKPIN, DOTSTAR_BGR);
int8_t ranges[][3][2] = {
  /*klaus*/ { /*trolley*/{11, 16}, /*exp*/{0, 5}, /*walk*/{6, 10}}, 
  /*clough*/{ /*exp*/{32, 37}, /*trolley*/{21, 25}, /*walk*/{27, 31}}
};

uint32_t colors[][4] = {
  {0xc18b18, 0xfcff16, 0x11F303, 0x1229E9},
  {0xfcff16, 0xc18b18, 0x11F303, 0x1229E9}
};

// GT config
const char* ssid     = "GTother";
const char* password = "GeorgeP@1927";
// Home WIFI
//const char* ssid     = "ATT9Gz6Unk";
//const char* password = "75h5286hc3fu";

const char host[] = "chi01.xuleijr.com";
const char path[] = "/api/suggest";
const uint16_t port = 8080;
const char *header_keys[] = {
  "User-Agent", "Set-Cookie", "Cookie", "Date", "Content-Type", "Content-Length"
};
size_t header_cnt = sizeof(header_keys) / sizeof(char*);
HTTPClient http;

byte mac[6];                     // the MAC address of your Wifi shield

void setup() {
  Serial.begin(115200);
  delay(100);

  // We start by connecting to a WiFi network
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  iwconfig();
  
  http.setReuse(true);
  http.collectHeaders(header_keys, header_cnt);
  
  strip.begin();
  for(int i = 0; i < NUMPIXELS; i++) {
    strip.setPixelColor(i, 0);
  }
  strip.show();
}

void loop() {
  delay(5000);

  Serial.printf("\n\nConnecting to %s\n", host);
  
  // Start http
  http.begin(host, port, path);
  int code = http.GET();
  Serial.printf("Received HTTP code: %d\n", code);
  if(HTTP_CODE_OK == code) {
    StaticJsonBuffer<512> jsonBuffer;
    const String &content = http.getString();
    Serial.println(content);
    JsonObject& root = jsonBuffer.parseObject(content);
    int c = suggest(root, "clough", "klaus");
    int k = suggest(root, "klaus", "clough");
    Serial.printf("Suggestion: clough = %d, klaus = %d\n", c, k);
    light_up(KLAUS, k, false);
    light_up(CLOUGH, c, false);
  } else {
    iwconfig();
    // TODO use led or dot start to indicate network failure. 
  }
  http.end();
}

// 0 - direct bus
// 1 - indirect bus + walk
// 2 - walk only
uint8_t suggest(JsonObject &root, const char *major, const char *alt) {
  double n0 = root[major]["next"][0];
  double a0 = root[major]["ahead"];
  n0 += a0;
  
  double n1 = root[alt]["next"][0];
  double a1 = root[alt]["ahead"];
  double w1 = root["c2k"]["walk"];
  n1 += a1 + w1;
  
  double n2 = root[major]["walk"];
  
  return n0 < n1? (n0 < n2? 0 : 2) : (n1 < n2? 1 : 2);
}

int8_t prior[] = {-1, -1};
void light_up(int8_t id, int8_t suggestion, bool pulse) {
  int8_t s0 = prior[id];
  Serial.printf("p0, id = %d, suggestion = %d\n", id, suggestion);
  Serial.println("p1");
  if(suggestion != s0) {
    Serial.println("p2");
    if(0 <= s0 && s0 < 3) {
      for(int i = ranges[id][s0][0]; i < ranges[id][s0][1]; i++) {
        strip.setPixelColor(i, 0);
      }
    }
    Serial.printf("p3 %d to %d\n", ranges[id][suggestion][0], ranges[id][suggestion][1]);
    for(int i = ranges[id][suggestion][0]; i < ranges[id][suggestion][1]; i++) {
      uint32_t c = colors[id][suggestion];
      Serial.printf("Setting pixel %d to #%X\n", i, c);
      strip.setPixelColor(i, c);
    }
    strip.show();
    prior[id] = suggestion;
  }
  // pulsing loop
}

void iwconfig() {
  Serial.printf("IP address: %s\n", WiFi.localIP().toString().c_str());

  //print mac address
  WiFi.macAddress(mac);
  for(int i = 0; i < 6; i++) {
    Serial.printf(0 == i? "MAC: %X" : ":%X", mac[i]);
  }
}
