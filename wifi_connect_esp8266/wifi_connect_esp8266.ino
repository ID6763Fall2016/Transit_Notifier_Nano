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

#define BUS_TIME(n, a) (-1 == n? 999999 : (n + a))

Adafruit_DotStar strip = Adafruit_DotStar(
  NUMPIXELS, DATAPIN, CLOCKPIN, DOTSTAR_BGR);
int8_t ranges[][4][2] = {
  /*klaus*/ { /*trolley*/{13, 18}, /*exp*/{2, 7}, /*walk*/{8, 12}, /*4: all*/{2, 18}}, 
  /*clough*/{ /*exp*/{34, 39}, /*trolley*/{23, 27}, /*walk*/{29, 33}, /*4: all */{23, 39}}
};

uint32_t colors[][4] = {
  {0xce8323, 0xFFFF00, 0xFFFFFF, 0x1229E9},
  {0xFFFF00, 0xce8323, 0xFFFFFF, 0x1229E9}
};

uint32_t pulse_colors[][5] = {
  {0xce8323, 0x674212, 0x322106, 0x161003, 0x0},
  {0xFFFF00, 0x808000, 0x404000, 0x161600, 0x0}
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
  strip.begin();
  for(int i = 0; i < NUMPIXELS; i++) {
    strip.setPixelColor(i, 0);
  }
  for(int j = 0; j < 2; j++) {
    for(int i = ranges[j][2][0]; i < ranges[j][2][1]; i++) {
      strip.setPixelColor(i, 0xFF8000);
    }
  }
  strip.show();
  
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
}

void loop() {

  Serial.printf("\n\nConnecting to %s\n", host);
  
  // Start http
  http.begin(host, port, path);
  int code = http.GET();
  Serial.printf("Received HTTP code: %d\n", code);
  int pt = 0;
  if(HTTP_CODE_OK == code) {
    StaticJsonBuffer<512> jsonBuffer;
    const String &content = http.getString();
    Serial.println(content);
    JsonObject& root = jsonBuffer.parseObject(content);
    int sc = suggest(root, "c", "k");
    int sk = suggest(root, "k", "c");
    light_up(KLAUS, sk, false);
    light_up(CLOUGH, sc, false);
    bool ck = (1 == root["k"]["c"]); // crowdedness of trolley
    bool cc = (1 == root["c"]["c"]); // ... of tech exp
    Serial.printf("Trolley crowded = %d, Tech exp crowded = %d\n", ck, cc);
    pt = pulse(sc, sk, cc, ck);
  } else {
    iwconfig();
    // TODO use led or dot start to indicate network failure. 
  }
  http.end();
  delay(pt > 5000? 10 : (5000 - pt));
}

// 0 - direct bus
// 1 - indirect bus + walk
// 2 - walk only
uint8_t suggest(JsonObject &root, const char *major, const char *alt) {
  int n0 = root[major]["n"][0];
  int a0 = root[major]["a"];
//  printf("n0 = %d, a0 = %d\n", n0, a0);
  n0 = BUS_TIME(n0, a0);
  
  int n1 = root[alt]["n"][0];
  int a1 = root[alt]["a"];
  int w1 = root["c2k"]["w"];
//  printf("n1 = %d, a1 = %d, w1 = %d\n", n1, a1, w1);
  n1 = BUS_TIME(n1, a1 + w1);
  
  int n2 = root[major]["w"];
  Serial.printf("n0 = %d, n1 = %d, n2 = %d\n", n0, n1, n2);
  
  return n0 < n1? (n0 < n2? 0 : 2) : (n1 < n2? 1 : 2);
}

int8_t prior[] = {-1, -1};
void light_up(int8_t id, int8_t suggestion, bool pulse) {
  int8_t s0 = prior[id];
  Serial.printf("p0, id = %d, suggestion = %d\n", id, suggestion);
  if(suggestion != s0) {
    for(int i = ranges[id][3][0]; i < ranges[id][3][1]; i++) {
      strip.setPixelColor(i, 0);
    }
    for(int i = ranges[id][suggestion][0]; i < ranges[id][suggestion][1]; i++) {
      uint32_t c = colors[id][suggestion];
      Serial.printf("Setting pixel %d to #%X\n", i, c);
      strip.setPixelColor(i, c);
    }
    if(1 == suggestion) { // partial walking
      for(int i = ranges[id][2][0]; i < ranges[id][2][0] + 2; i++) {
        uint32_t c = colors[id][3];
        Serial.printf("Setting pixel %d to #%X\n", i, c);
        strip.setPixelColor(i, c);
      }
    }
    strip.show();
    prior[id] = suggestion;
  }
  // pulsing loop
}

int pulse(int sc, int sk, bool cc, bool ck) {
  int cnt = 0;
  if((0 == sc && cc) || (1 == sc && ck)) cnt ++;
  if((0 == sk && ck) || (1 == sk && cc)) cnt ++;
  Serial.printf("%d needs pulse\n", cnt);
  if(0 == cnt) return 0;
  int8_t *params = new int8_t[cnt * 6];
  int idx = fill_params(params, cc, ck, 0, sc, CLOUGH);
  idx = fill_params(params, ck, cc, idx, sk, KLAUS);
    for(int m = 0; m < 2; m++) {
    for(int k = 0; k < 5 * 2; k++) {
      delay(50);
      for(int i = 0; i < cnt; i++) {
         Serial.printf("i0 = %d, i1 = %d, pi = %d, color seq = %d\n", 
           params[i * 6 + 0],params[i * 6 + 1],params[i * 6 + 2],
           params[i * 6 + 3]);
         for(int8_t j = params[i * 6 + 0]; j < params[i * 6 + 1]; j++) {
           uint32_t c = pulse_colors[params[i * 6 + 3]][k < 5? k : (5 * 2 - 1 - k)];
           Serial.printf("Setting %d to color %X\n", j, c);
           strip.setPixelColor(j, c);
         }
      }
      strip.show();
    }
  }
  return 250 * 9 * 2;
}

int fill_params(int8_t *p, bool c0, bool c1, int idx, int s, int8_t id) {
  if((0 == s && c0) || (1 == s && c1)) {
        p[idx * 6] = ranges[id][s][0];
        p[idx * 6 + 1] = ranges[id][s][1];
        p[idx * 6 + 2] = 0;
        p[idx * 6 + 3] = id == KLAUS? s : (1 - s); // color sequence idx
        return idx + 1;
  } else return idx;
}

void iwconfig() {
  Serial.printf("IP address: %s\n", WiFi.localIP().toString().c_str());

  //print mac address
  WiFi.macAddress(mac);
  for(int i = 0; i < 6; i++) {
    Serial.printf(0 == i? "MAC: %X" : ":%X", mac[i]);
  }
}
