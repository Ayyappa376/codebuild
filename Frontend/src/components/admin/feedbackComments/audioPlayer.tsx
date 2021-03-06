import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { IRootState } from "../../../reducers";
import { getSignedUrl } from "./methods";

const AudioPlayer = (props: any) => {
  const {url} = props;
  const [signedUrl, setSignedUrl] = useState('');
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });

  useEffect(() => {
    let unmount = false;

    if (!unmount && url) {
      getSignedUrl(url, stateVariable).then((fetchSignedUrl: any) => {
        setSignedUrl(fetchSignedUrl);
      });
    }
    return (() => {
      unmount = true;
    })
  }, [url])

  return (
    <div>
      {signedUrl !== '' ?
        <audio src={signedUrl} controls preload='auto'/> :
        <audio src={''}  />
      }
    </div>
  );
};

export default AudioPlayer;