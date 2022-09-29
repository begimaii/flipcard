import React, { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import axios from "axios";
import "./App.css";

// 1. useState
// 2. useEffect

const mainUrl = "https://api.unsplash.com/photos/";

const key = "67dzJ6HsOJ0oE9moFGN9_AGJ-de6jwkL-CAULtu3QWg";

// https://api.unsplash.com/photos//?client_id=67dzJ6HsOJ0oE9moFGN9_AGJ-de6jwkL-CAULtu3QWg&page=3

const App = () => {
  const [listOfImages, setListOfImages] = useState([]);
  const [loading, setLoading] = useState("Loading...");
  const [selected, setSelected] = useState(null);
  const [click, setClick] = useState(false);
  const [totalSteps, setTotalSteps] = useState(0);
  const [reset, setReset] = useState(false);

  const handleFetching = () => {
    const url1 = `${mainUrl}/?client_id=${key}&page=${3}`;
    const url2 = `${mainUrl}/?client_id=${key}&page=${4}`;

    // DRY coding === Don't Repeat Yourself

    // .then() vs async/await

    axios
      .all([axios.get(url1), axios.get(url2)])
      .then(([page1, page2]) => {
        console.log(page1.data, page2.data);

        let data = [
          ...page1.data,
          ...page1.data,
          ...page2.data.slice(0, 2),
          ...page2.data.slice(0, 2),
        ];

        data = data.map((item) => {
          return { ...item, uniqueId: nanoid() };
        });

        data = shuffle(data);

        console.log(data);
        setListOfImages(data);
      })
      .catch((err) => {
        console.log(err);
      });

    // const responseOne = await axios.get(url1);

    // const responseTwo = await axios.get(url2);

    // console.log(responseOne.data, responseTwo.data);

    // let newList = [
    //   ...responseOne.data,
    //   ...responseTwo.data,
    //   ...responseOne.data,
    // ];

    // setListOfImages(newList);
  };

  const shuffle = (array) => {
    for (let i = 0; i < array.length; i++) {
      let temp = Math.floor(Math.random() * array.length);
      let curr = array[temp];
      array[temp] = array[i];
      array[i] = curr;
    }
    return array;
  };

  const handleClick = (id) => {
    // get index of clicked image
    const found = listOfImages.findIndex((i) => i.uniqueId === id);
    // found === index of the image

    // if (!listOfImages[found].blur_hash) {
    //   return;
    // }

    const modified = listOfImages.map((i) => {
      if (i.uniqueId === id) {
        return { ...i, picked_by_user: true };
      }
      return i;
    });

    if (selected === null) {
      // we pick the img at a certan index
      setSelected(modified[found]);
      // grab array of objects with picked_by_user
      setListOfImages(modified);
      // if click occured then that is a step, se we increment by 1
      setTotalSteps(totalSteps + 1);
    } else {
      // if we don't set out list to modified it is not going to open 2nd card
      // Why? because 2nd card is set to null
      setListOfImages(modified);
      // if 1st and 2nd imgs didn't match, we do...
      if (listOfImages[found].id !== selected.id) {
        // if ids of 1st and 2nd imgs don't match we were not able to match 1st flipped card so we increment counter by 1
        setTotalSteps(totalSteps + 1);
        // since we didn't get a match, we need to reset everything to picked_by_user: false
        // because we need to hide images and start all over
        const data = listOfImages.map((i) => ({ ...i, picked_by_user: false }));
        // we did click on img so we need to setClick to true
        setClick(true);
        // after flipping 2nd card it needs to wait 1 sec
        setTimeout(() => {
          // we didn't guess 2nd img so we need to unmark picked_by_user
          // we need to set the list to picked_by_user: false so it hides everything again
          setListOfImages(data);
          // we need to unmark clicked imgs so we are able to click on them again
          setClick(false);
        }, 1000);
        // unmark img as selected because we start again
        setSelected(null);
      }
      // if clicked img and state photo has common id, we apply identifier for further deactivation
      else {
        // check if same img is not clicked twice
        if (listOfImages[found].uniqueId !== selected.uniqueId) {
          // just like comparing natural ids, if we didn't get a match, we need to do the same for uniqueIds as well
          // why? because there is no match we need to increment counter
          setTotalSteps(totalSteps + 1);

          // we grab the existing object and we add 1 more key called blur_hash
          const newData = listOfImages.map((i) =>
            i.id === selected.id ? { ...i, blur_hash: "" } : i
          );
          // two images will have empty blur_hash, so no longer will be disappeared and active
          setListOfImages(newData);
          // empty temp state
          setSelected(null);
        }
      }
    }
  };

  useEffect(() => {
    setLoading("Loading ...");
    setSelected(null);
    setTotalSteps(0);
    setListOfImages([]);
    setTimeout(() => {
      setLoading("");
      handleFetching();
    }, 500);
  }, [reset]);

  const resetApp = () => {
    setReset(!reset);
  };

  return (
    <>
      <div className="App">
        {listOfImages.map((item) => {
          let imgClass;
          if (!item.picked_by_user) {
            imgClass = "";
          }
          if (item.picked_by_user || !item.blur_hash) {
            imgClass = "show";
          }
          return (
            <div
              key={item.uniqueId}
              disabled={!item.blur_hash}
              className="single-card"
              // if div is not clicked then we handleClick() or just return null === no action required
              onClick={!click ? () => handleClick(item.uniqueId) : null}
            >
              <img
                src={item.urls.thumb}
                alt={item.alt_description}
                className={imgClass}
              />
            </div>
          );
        })}
      </div>
      <div id="click">
        <span>Clicks</span>
        <span id="counter">{totalSteps}</span>
        <button onClick={resetApp}>Reset</button>
      </div>
    </>
  );
};

export default App;
