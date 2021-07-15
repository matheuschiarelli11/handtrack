import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as handpose from "@tensorflow-models/handpose";
import thumbs_up from "../../thumbs_up.png";
import * as fp from "fingerpose";
import "@tensorflow/tfjs-backend-webgl";

import { drawHand } from "./drawfunction";

function HandTrack() {
  const [emoji, setEmoji] = useState(null);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const images = { thumbs_up: thumbs_up };

  useEffect(() => {
    const runHandpose = async () => {
      const net = await handpose.load();
      console.log("ok");
      setInterval(() => detect(net), 100);
    };

    runHandpose();
  }, []);

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoHeight = webcamRef.current.video.videoHeight;
      const videoWidth = webcamRef.current.video.videoWidth;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const hand = await net.estimateHands(video);
      console.log(hand);

      //FAZENDO A IDENTIFICAÇÃO DE GESTOS

      //verificando se a variavel "Hand" esta detectando interações.
      if (hand.length > 0) {
        /* criando a variavel GE que receberá a função GestureEstimator que guarda
        o array de gestos que queremos que seja identificado */
        const GE = new fp.GestureEstimator([fp.Gestures.ThumbsUpGesture]);

        /* criando variavel assíncrona gesture que vai identificar o tipo de gesto
        esperado e passamos a variavel "hand" como parâmetro, e um numero minimo
        para o nivel de detecção. */
        const gesture = await GE.estimate(hand[0].landmarks, 4);
        console.log(gesture);

        /* verificando se os gestos estão sendo detectados*/
        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          /* a variavel confidence irá guardar um array e gestos e percorre-lo
          passando o nivel de detecção (prediction) como propriedade para que assim
          o script possa ter certeza de qual gesto esta sendo feito pelo usuário*/
          const confidence = gesture.gestures.map(
            (prediction) => prediction.confidence
          );

          /*maxConfidence ira pegar o index do gesto no array de gestos, e vai
          identificar o gesto que esta mais evidente na câmera */
          const maxConfidence = confidence.indexOf(
            Math.max.apply(null, confidence)
          );

          // quando o gesto for identificado, o emoji é renderizado em tela
          //(notar que essa verificação é feita porque há só um gesto esperado na
          // variavel GE, isso vai mudar caso adicione mais gestos)
          if (GE) {
            setEmoji(gesture.gestures[maxConfidence].name);
          }
        }
      }

      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        {emoji !== null ? (
          //colocando emoji na tela
          <img
            alt=""
            src={images[emoji]}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 400,
              bottom: 500,
              right: 0,
              textAlign: "center",
              height: 100,
            }}
          />
        ) : (
          ""
        )}
      </header>
    </div>
  );
}
export default HandTrack;
