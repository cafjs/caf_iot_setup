#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
pushd ${DIR}
sudo cp etc/default/caf_daemon /etc/default/
sudo cp etc/default/caf_ws /etc/default/
sudo cp etc/init.d/caf /etc/init.d/
sudo cp etc/init.d/caf_ws /etc/init.d/
sudo cp usr/bin/caf_daemon /usr/bin/
sudo cp usr/bin/caf_ws /usr/bin/
sudo update-rc.d caf defaults
sudo update-rc.d caf_ws defaults
popd
