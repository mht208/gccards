#!/bin/bash

IMPORT=import
VER=$1
IMAGE_HOME=images/${VER}

if [[ "${VER}" != "en" && "${VER}" != "jp" ]]; then
  echo "./move [en | jp]"
  exit
fi

for f in `ls ${IMPORT}/*.png`; do
  bn=`basename ${f}`
  case ${bn} in
    battle*)
      mv ${f} ${IMAGE_HOME}/battle/
      ;;
    card_thu*)
      mv ${f} ${IMAGE_HOME}/avatars/
      ;;
    card*)
      id=${bn/card/}
      id=${id/.png/}
      ids="${ids}${id} "
      cp ${f} ${IMAGE_HOME}/guardians/
      ;;
    *)
      echo "Unknown image file: ${f}" 
      ;;
  esac
done

/bin/bash procimgs
/bin/bash upload ${VER} ${ids}
