#!/bin/bash
echo "WPA setup script called  <ssid> <wpaPassword>" $1 $2 
wpa_passphrase $1 $2 > foo.conf
cat  wpa_supplicant.conf >> foo.conf
mv wpa_supplicant.conf wpa_supplicant.conf.bak
mv foo.conf wpa_supplicant.conf
