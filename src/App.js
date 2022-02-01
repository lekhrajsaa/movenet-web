import "./App.css";
import * as posedetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-core';
// Register WebGL backend.
import '@tensorflow/tfjs-backend-webgl';
import '@mediapipe/pose';
import { useEffect, useState, useMemo } from "react";
import { Camera } from './camera';

export default function App() {
  useEffect(() => {
    const loader = async () => {
      const createDetector = async () => {
        const detectorConfig = { modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
        return posedetection.createDetector(posedetection.SupportedModels.MoveNet, detectorConfig);
      }
      async function renderResult() {
        if (camera.video.readyState < 2) {
          await new Promise((resolve) => {
            camera.video.onloadeddata = (video) => {
              resolve(video);
            };
          });
        }
        let poses = null;
        if (detector != null) {
          try {
            poses = await detector.estimatePoses(
              camera.video,
              { maxPoses: 1, flipHorizontal: false });
          } catch (error) {
            detector.dispose();
            detector = null;
            alert(error);
          }
        }

        camera.drawCtx();

        if (poses && poses.length > 0) {
          camera.drawResults(poses);
        }
      }
      async function renderPrediction() {
        await renderResult();
        const rafId = requestAnimationFrame(renderPrediction);
      };
      const camera = await Camera.setupCamera({ targetFPS: 60, sizeOption: '640 X 480' });
      const detector = await createDetector()
      renderPrediction()
    }
    loader()
  }, [])
  return (
    <div className="App" id="main" style={{
      position: 'relative',
      margin: 0
    }}>
      <div class="container">
        <div class="canvas-wrapper" style={{ position: 'relative' }}>
          <canvas id="output"></canvas>
          <video id="video" playsInline>
          </video>
        </div>
        {/* <div id="scatter-gl-container"></div> */}
      </div>
    </div>
  );
}
