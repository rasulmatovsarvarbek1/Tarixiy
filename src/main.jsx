import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import App from './App.jsx'

const startupImagePaths = [
  '/amir_temur_cover.jpg',
  '/black.jpg',
  '/coin.png',
  '/splash-dragon.png',
  '/star_icon.jpg',
  '/white.png',
  '/game-images/kirish.png',
  '/game-images/game-banner.png',
  '/game-images/bg-arena.png',
  ...Array.from({ length: 4 }, (_, index) => `/game-images/knight${index + 1}.png`),
  ...Array.from({ length: 4 }, (_, index) => `/game-images/drogon${index + 1}.png`),
  '/drako-image/drako1.png',
  '/drako-image/drako2.png',
  '/drako-image/drako3.png',
  '/drako-image/drako-page1.1.png',
  '/drako-image/drako-page1.2.png',
  '/drako-image/drako-page1.3.png',
  '/drako-image/drako-quiz1.png',
  '/drako-image/drako-quiz2.png',
  '/drako-image/drako-quiz3.png',
  '/drako-image/drako-quizX.png',
  '/gifts/500.png',
  '/gifts/800.png',
  '/gifts/1000.png',
  '/gifts/15000.png',
];

startupImagePaths.forEach((path) => {
  const image = new Image();
  image.src = path;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
