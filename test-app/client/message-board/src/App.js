import { Quellify, lokiClientCache } from './quell-client/src/Quellify';
import { useRef, useState, useEffect } from 'react';
import './App.css';

function App() {
  const fetchInfo = useRef(null);
  const createInfo = useRef(null);
  const deleteInfo = useRef(null);

  console.log(lokiClientCache.data);

  const queryMap = { getCharacter: 'Character' };
  const mutationMap = {
    createCharacter: 'Character',
    deleteCharacter: 'Character',
  };
  const map = {
    Character: 'Character',
  };

  const [cache, setCache] = useState(lokiClientCache.data);

  const handleFetchClick = async (e) => {
    e.preventDefault();
    let startTime = new Date();
    console.log(lokiClientCache.data);

    const _id = fetchInfo.current.value;
    console.log(_id);
    // const results = await fetch('http://localhost:3434/graphql', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     query: `{
    //     getCharacter(_id: ${_id}){
    //       _id
    //       name
    //     }
    //   }`,
    //   }),
    // });

    const query = `query {
      getCharacter(_id: ${_id}){
        _id
       name
      }
     }`;

    const parsedResponse = await Quellify(
      'http://localhost:3434/graphql',
      query,
      mutationMap,
      map,
      queryMap
    );

    let endTime = new Date();
    let diff = endTime - startTime;
    const characterData = parsedResponse.data.data.getCharacter;
    const li = createLi(characterData, diff);
    const characterBoard = document.getElementById('character-list');
    characterBoard.appendChild(li);

    setCache(lokiClientCache.data);

    //update messageboard after creating new message
  };

  const clearCache = () => {
    lokiClientCache.clear();
    console.log(lokiClientCache);
    setCache(lokiClientCache.data);
  };

  const handleCreateClick = async (e) => {
    e.preventDefault();
    const name = createInfo.current.value;
    console.log(name);
    const results = await fetch('http://localhost:3434/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `mutation {
        createCharacter(name: "${name}"){
          _id
          name
        }
      }`,
      }),
    });
    const parsedResponse = await results.json();
    const characterData = parsedResponse.data.createCharacter;
    const li = createLi(characterData);
    const characterBoard = document.getElementById('character-list');
    characterBoard.appendChild(li);

    setCache(lokiClientCache.data);
  };

  const createLi = (character, time) => {
    //create button
    const name = character.name;
    const _id = character._id;
    let idAndName = `id: ${_id} \n name: ${name} \n timeElapsed:${time} ms`;
    //create new Li and append button to it
    const newLi = document.createElement('li');
    newLi.innerText = idAndName;
    return newLi;
  };

  const handleDeleteClick = async (e) => {
    e.preventDefault();
    const _id = deleteInfo.current.value;
    console.log(_id);
    const results = await fetch('http://localhost:3434/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `mutation{
        deleteCharacter(_id: ${_id}){
          _id
          name
        }
      }`,
      }),
    });
    const parsedResponse = await results.json();
    const characterData = parsedResponse.data.deleteCharacter;
    const li = createLi(characterData);
    let innerText = `(DELETED)\n`;
    innerText += li.innerText;
    li.innerText = innerText;
    const characterBoard = document.getElementById('character-list');
    characterBoard.appendChild(li);

    setCache(lokiClientCache.data);
  };

  const handleClearClick = () => {
    const characterBoard = document.getElementById('character-list');
    characterBoard.innerHTML = '';
  };

  return (
    <div id='container'>
      <h1>GET STARWARS CHARACTER</h1>
      <div className='row'>
        <input id='id' ref={fetchInfo} placeholder='id' type='text' />
        <button onClick={handleFetchClick} id='fetch'>
          FETCH
        </button>
        <input
          id='createName'
          ref={createInfo}
          placeholder='name'
          type='text'
        />
        <button onClick={handleCreateClick} id='create'>
          CREATE
        </button>
        <input
          id='deleteid'
          ref={deleteInfo}
          placeholder='delete'
          type='text'
        />
        <button onClick={handleDeleteClick} id='delete'>
          DELETE
        </button>
      </div>
      <ul id='character-list'></ul>
      <div id='clear-btn-container'>
        <button onClick={handleClearClick} id='clear'>
          Clear Board
        </button>
      </div>
      <div style={{ height: '50px' }}>
        <button id='cacheButton' onClick={clearCache}>
          Clear Cache
        </button>
      </div>
      <div className='cacheBoard'>
        Cache Board
        {cache.map((el, key) => {
          const cacheID = JSON.stringify(el.cacheID);
          const meta = JSON.stringify(el.meta);

          return (
            <div>
              {` id: ${el.id} -- cacheID: ${cacheID}
             -- queryType: ${el.queryType} -- meta: ${meta}
              -- $loki: ${el.$loki}`}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
