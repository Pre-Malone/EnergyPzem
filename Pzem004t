// ****************************************************************
//                         /-------------\
//                        /               \
//                       /                 \
//                      /                   \
//                      |   XXXX     XXXX   |
//                      |   XXXX     XXXX   |
//                      |   XXX       XXX   |
//                      \         X         /
//                       --\     XXX     /--
//                        | |    XXX    | |
//                        | |           | |
//                        | I I I I I I I |
//                        |  I I I I I I  |
//                         \             /
//                          --         --
//                            \-------/
//                    XXX                    XXX
//                   XXXXX                  XXXXX
//                   XXXXXXXXX         XXXXXXXXXX
//                          XXXXX   XXXXX
//                             XXXXXXX
//                          XXXXX   XXXXX
//                   XXXXXXXXX         XXXXXXXXXX
//                   XXXXX                  XXXXX
//                    XXX                    XXX
//                    **************************
//                    * Update 21/09/2568 V.1.0*
//                    * Generic Esp8266 Module *
//                    * COMPORT 1 Cleancode GPT*                       
//                    **************************
// ****************************************************************
#include <PZEM004Tv30.h>
#include <SoftwareSerial.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266mDNS.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>
#include <WiFiClientSecure.h>


// ---------- Blynk ----------
#define BLYNK_TEMPLATE_ID "TMPLUthP1NbA"
#define BLYNK_TEMPLATE_NAME "HomeEnergy"
#define BLYNK_AUTH_TOKEN "upMqylStCeN6xw7vhKykm1D82sa2dqdO"
#define BLYNK_PRINT Serial
#include <BlynkSimpleEsp8266.h>
// ---------- LINE Notify ----------
#define LINE_TOKEN "Nmo7P40Q3EIfihDhwvrITYTYjk2uuc4dSn2bMkQovbV"
#include <TridentTD_LineNotify.h>

// ---------- WiFi ----------
char auth[] = BLYNK_AUTH_TOKEN;
char ssid[] = "HOME_ASSISTANT";
char pass[] = "PE123456789";
char host[] = "script.google.com";
const int httpsPort = 443;

// ---------- Google Sheet ----------
String GAS_ID = "AKfycbyZQOq26UuwPFp3ytHusyJ3D_v0dItyV2YvbmsegN_FNypUyUVZOgNiCkysa0QvXCNe";

// ---------- PZEM ----------
SoftwareSerial pzemSWSerial(5, 4); // D1=TX(5), D2=RX(4)
PZEM004Tv30 pzem(pzemSWSerial);

// ---------- Timer ----------
BlynkTimer timer;

float value1, value2;
int i = 0;

// ---------- Setup ----------
void setup() {
  Serial.begin(115200);
  Serial.println("Booting...");

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, pass);
  while (WiFi.waitForConnectResult() != WL_CONNECTED) {
    Serial.println("WiFi Failed! Rebooting...");
    delay(5000);
    ESP.restart();
  }

  // OTA
  ArduinoOTA.setHostname("myesp8266");
  ArduinoOTA.setPassword("123");
  ArduinoOTA.onStart([]() {
    LINE.setToken(LINE_TOKEN);
    LINE.notify("OTA Update Start");
  });
  ArduinoOTA.onEnd([]() {
    LINE.notify("OTA Update End");
  });
  ArduinoOTA.begin();

  Serial.println("Ready");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Blynk
  Blynk.begin(auth, ssid, pass);

  // LINE
  Serial.println(LINE.getVersion());
  LINE.setToken(LINE_TOKEN);
  LINE.notify("Energy Monitor Started");

  // ---------- ตั้งเวลา ----------
  timer.setInterval(5000L, SendEnergy);          // ทุก 5 วิ
  timer.setInterval(3600000L, SendEnergy1);      // ทุก 1 ชม.
  timer.setInterval(60000L, update_google_sheet);// ทุก 1 นาที
}

// ---------- Loop ----------
void loop() {
  Blynk.run();
  timer.run();
  ArduinoOTA.handle();
}

// ---------- ฟังก์ชัน ----------
void SendEnergy() {
  float voltage = pzem.voltage();
  float current = pzem.current();
  float power   = pzem.power();
  float energy  = pzem.energy();
  float freq    = pzem.frequency();
  float pf      = pzem.pf();

  if (isnan(voltage) || isnan(current) || isnan(power) || isnan(energy) || isnan(freq) || isnan(pf)) {
    Serial.println("Error reading PZEM data");
    return;
  }

  // Serial Monitor
  Serial.printf("Volt=%.1fV, Amp=%.2fA, Power=%.1fW, Energy=%.3fkWh, Frequency=%.1fHz, PF=%.2f\n",
                voltage, current, power, energy, freq, pf);

  // ส่งค่าไป Blynk
  Blynk.virtualWrite(V0, voltage);
  Blynk.virtualWrite(V1, current);
  Blynk.virtualWrite(V2, power);
  Blynk.virtualWrite(V3, pf * 100);
  Blynk.virtualWrite(V4, freq);
  Blynk.virtualWrite(V5, energy);
}

void SendEnergy1() {


  float kWhPerDay;
  if (i == 0) value1 = pzem.energy();
  i++;

  if (i == 24) {
    value2 = pzem.energy();
    kWhPerDay = value2 - value1;
    Blynk.virtualWrite(V6, kWhPerDay);
    Serial.printf("kWhPerDay=%.3f kWh\n", kWhPerDay);
    i = 0;
  }
}

void update_google_sheet() {
  WiFiClientSecure client;
  client.setInsecure(); // ข้ามการตรวจสอบ SSL

  if (!client.connect(host, httpsPort)) {
    Serial.println("Google connection failed");
    return;
  }

  float voltage = pzem.voltage();
  float current = pzem.current();
  float power   = pzem.power();
  float energy  = pzem.energy();
  float kWhPerDay = value2 - value1;

  String url = "/macros/s/" + GAS_ID + "/exec?";
  url += "Volt=" + String(voltage);
  url += "&Current=" + String(current);
  url += "&Power=" + String(power);
  url += "&Energy=" + String(energy);
  url += "&KWhPerDay=" + String(kWhPerDay);

  Serial.println("Requesting: " + url);

  client.print(String("GET ") + url + " HTTP/1.1\r\n" +
               "Host: " + host + "\r\n" +
               "Connection: close\r\n\r\n");
  Serial.println("Data sent to Google Sheet");
}
