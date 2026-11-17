(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const other = name => name === 'alex' ? 'sam' : 'alex';
  const proper = name => name === 'alex' ? 'Alex' : 'Mia';
  const phrase = (giver,speaker) => giver === speaker ? 'I give you the ball.' : 'You give me the ball.';
  // Each word gets its own span. We do NOT split audio into separate utterances.
  // This keeps the speech fluent while allowing pronoun bubbles and read-along cues.
  function markedPhrase(giver,speaker) {
    const words=phrase(giver,speaker).replace(/[.]/g,'').split(' ');
    return words.map((word,index)=>{
      const key=word.toLowerCase(),pronoun=['i','you','me'].includes(key);
      return `<span class="spoken-word${pronoun?' pronoun-focus':''}" data-speech-index="${index}" data-word="${key}">${pronoun?word.toUpperCase():word}</span>`;
    }).join(' ') + '.';
  }
  const stages = {
    action:{k:'Step 1 · Action',h:'Follow the ball',d:'First, look at who gives the ball and who gets it. We will use names, not pronouns.'},
    speaker:{k:'Step 2 · Speaker',h:'Who is talking?',d:'The ball keeps going the same way. Only the person speaking changes.'},
    mix:{k:'Step 3 · Combine',h:'Put it together',d:'First find who gives the ball. Then choose the words the speaker would say.'},
    listen:{k:'Step 4 · Transfer',h:'Listen & match',d:'Listen to a sentence. Pick the picture that goes with it.'}
  };
  const actionTrials=[['alex','giver'],['alex','receiver'],['sam','giver'],['sam','receiver'],['alex','giver'],['sam','receiver']];
  const speakerTrials=['sam','alex','sam','alex','sam','alex'];
  const mixTrials=[['alex','alex'],['alex','sam'],['sam','alex'],['sam','sam'],['sam','alex'],['alex','alex'],['sam','sam'],['alex','sam']];
  const listenTrials=[['alex','sam'],['sam','sam'],['sam','alex'],['alex','alex'],['sam','sam'],['alex','sam'],['alex','alex'],['sam','alex']];
  const stats={completed:0,first:0,helped:0,action:0,perspective:0,match:0,hints:0};
  let stage='action', idx={action:0,speaker:0,mix:0,listen:0}, giver='alex', speaker='alex', sub='role', speakerDemo=true, done=false, hadError=false, openedHint=false, countedError=false, currentQuestionKey='', animTimer;
  const safeSpeech = () => 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const voicePrefs = {alex:'auto',sam:'auto'};
  let englishVoices = [], speakingToken=0, speechTimeout=null;
  function stopSpeech() {
    speakingToken++;
    clearTimeout(speechTimeout);
    clearWordTimers();clearWordHighlight();
    if(activeAudio){activeAudio.pause();activeAudio=null;}
    delete document.body.dataset.speaking;
    if(safeSpeech()) try {window.speechSynthesis.cancel();} catch(e) { /* Nothing to stop. */ }
  }
  // Browser voice metadata does not expose gender or quality consistently.
  // These names are common installed voice labels, not guarantees of vocal identity.
  function guessedGender(voice) {
    const n=voice.name.toLowerCase();
    if(/\b(female|woman|girl)\b|samantha|zira|jenny|aria|ava|victoria|karen|susan|tessa|allison|emma|hazel|fiona|moira|serena|olivia|salli|joanna|kimberly|kendra|amy|nicole|siri female|google us english 1/.test(n))return 'female';
    if(/\b(male|man|boy)\b|\bguy\b|ryan|brian|daniel|david|george|james|matthew|andrew|eric|mark|oliver|christopher|aaron|fred|\balex\b|tony|arthur|russell|tom|michael|joey|justin|\bgraham\b|google us english 2/.test(n))return 'male';
    return 'unknown';
  }
  function voiceRank(voice,character) {
    const n=voice.name.toLowerCase(), target=character==='alex'?'male':'female', gender=guessedGender(voice);
    let score=0;
    if(/^en-us/i.test(voice.lang))score+=14;
    if(/^en(?:-|$)/i.test(voice.lang))score+=18;
    if(/natural|neural|premium|enhanced|online|wavenet|studio|high quality/.test(n))score+=42;
    if(gender===target)score+=120;
    if(gender!=='unknown'&&gender!==target)score-=120;
    if(/boy|girl|child|young|junior|kid/.test(n))score+=14;
    return score;
  }
  function resolveVoice(name) {
    if(!englishVoices.length)return null;
    const selected=voicePrefs[name];
    if(selected!=='auto')return englishVoices.find(v=>v.voiceURI===selected)||englishVoices.find(v=>v.name===selected)||null;
    const otherName=other(name);
    const otherSelection=voicePrefs[otherName];
    const alreadySelected=otherSelection!=='auto' ? englishVoices.find(v=>v.voiceURI===otherSelection) : null;
    const sorted=[...englishVoices].sort((a,b)=>voiceRank(b,name)-voiceRank(a,name)||a.name.localeCompare(b.name));
    return sorted.find(v=>v.voiceURI!==alreadySelected?.voiceURI) || sorted[0];
  }
  function updateVoiceStatus() {
    const el=$('voiceStatus');
    if(!safeSpeech()){el.textContent='Speech is not available in this browser. Written sentences will still work.';return;}
    if(!englishVoices.length){el.textContent='No English voices reported yet. The browser may use its default voice.';return;}
    const a=resolveVoice('alex'), b=resolveVoice('sam'), ga=a?guessedGender(a):'unknown',gb=b?guessedGender(b):'unknown';
    const distinct=a?.voiceURI!==b?.voiceURI;
    const notice= !distinct ? 'Only one distinct voice was selected; install additional voices or choose alternatives.'
      : ga!=='male'||gb!=='female' ? 'Voices differ, but their gender cannot be confirmed from the browser’s voice names. Please listen and adjust.'
      : 'Distinct male- and female-labelled voices selected.';
    el.textContent=`Alex (boy): ${a?.name||'browser default'}. Mia (girl): ${b?.name||'browser default'}. ${notice}`;
  }
  function refreshVoices() {
    if(!safeSpeech()) {updateVoiceStatus();return;}
    try {englishVoices=window.speechSynthesis.getVoices().filter(v=>/^en(?:-|$)/i.test(v.lang));}
    catch(e){englishVoices=[];}
    for(const name of ['alex','sam']) {
      const select=$(`${name}Voice`), value=voicePrefs[name];
      select.replaceChildren(new Option(`Automatic (${name==='alex'?'male':'female'} preferred)`,'auto'));
      for(const voice of englishVoices)select.add(new Option(`${voice.name} (${voice.lang})`,voice.voiceURI));
      select.value=Array.from(select.options).some(opt=>opt.value===value)?value:'auto';
      voicePrefs[name]=select.value;
    }
    updateVoiceStatus();
  }
  // Full-sentence speech eliminates the unnatural pauses caused by queueing words.
  // Browser word-boundary callbacks are best-effort, so a timed backup drives the
  // visual cues when a voice doesn't emit boundaries. (Pre-recorded clips can use
  // frame-accurate timestamps in a later version.)
  let wordTimerIds=[],activeAudio=null;
  function clearWordTimers(){wordTimerIds.forEach(clearTimeout);wordTimerIds=[];}
  function allWords(text){
    return [...text.matchAll(/\b[\w']+\b/g)].map(match=>({word:match[0],offset:match.index}));
  }
  function spokenWord(index,words,name){
    if(index<0||index>=words.length)return;
    const w=words[index].word.toLowerCase(),focused=['i','you','me'].includes(w);
    document.body.dataset.speaking=name;
    if(focused){document.body.dataset.focus=w.toUpperCase();}else delete document.body.dataset.focus;
    for(const node of document.querySelectorAll('#liveSentence .spoken-word,#listenPrompt .spoken-word,.choice.correct .spoken-word')) {
      node.classList.toggle('active-word',Number(node.dataset.speechIndex)===index);
    }
    for(const bubble of document.querySelectorAll(`.person-${name} .bubble-word`))bubble.textContent=focused?w.toUpperCase():'';
    for(const bubble of document.querySelectorAll('.speaker-portrait-word'))bubble.textContent=focused?w.toUpperCase():'';
  }
  function clearWordHighlight(){
    document.querySelectorAll('.spoken-word.active-word').forEach(el=>el.classList.remove('active-word'));
    document.querySelectorAll('.speaker-portrait-word,.bubble-word').forEach(el=>el.textContent='');
    delete document.body.dataset.focus;
  }
  function say(words, name=speaker) {
    if(!safeSpeech()){updateVoiceStatus();return;}
    stopSpeech();
    const token=speakingToken, chosen=resolveVoice(name), terms=allWords(words);
    const rate=1.03; // normal pace; no artificial silences or isolated pronouns
    let gotBoundary=false;
    const finish=()=>{if(token===speakingToken){clearWordTimers();clearWordHighlight();delete document.body.dataset.speaking;clearTimeout(speechTimeout);}};
    try{
      const utter=new SpeechSynthesisUtterance(words);
      if(chosen)utter.voice=chosen;
      utter.lang=chosen?.lang||'en-US';utter.rate=rate;utter.pitch=name==='alex'?1.00:1.03;utter.volume=1;
      utter.onstart=()=>{
        if(token!==speakingToken)return;
        document.body.dataset.speaking=name;
        spokenWord(0,terms,name);
        // Fallback estimates are replaced when native boundary events arrive.
        // Estimated word times follow reading length, rather than introducing pauses.
        const duration=words.length*82/rate+500;
        let weighted=0;
        const weights=terms.map(t=>Math.max(1.7,t.word.length*.52));
        const total=weights.reduce((a,b)=>a+b,0);
        for(let i=1;i<terms.length;i++){
          weighted+=weights[i-1];
          const ms=Math.round(duration*weighted/total);
          wordTimerIds.push(setTimeout(()=>{if(token===speakingToken&&!gotBoundary)spokenWord(i,terms,name);},ms));
        }
      };
      utter.onboundary=(event)=>{
        if(token!==speakingToken||event.name&&event.name!=='word')return;
        gotBoundary=true;clearWordTimers();
        const index=terms.findLastIndex(term=>term.offset<=event.charIndex);
        spokenWord(Math.max(0,index),terms,name);
      };
      utter.onend=finish;utter.onerror=finish;
      window.speechSynthesis.speak(utter);
      speechTimeout=setTimeout(finish,Math.max(4500,words.length*260));
    }catch(e){finish();updateVoiceStatus();}
  }
  const updateStats = () => {
    $('statFirst').textContent=`${stats.first} / ${stats.completed}`;
    $('statHelp').textContent=stats.helped;
    $('statAction').textContent=stats.action;
    $('statPerspective').textContent=stats.perspective;
    $('statMatch').textContent=stats.match;
    $('statHints').textContent=stats.hints;
  };
  function cardPerson(x,name,talking,isGiver=false){
    const blue=name==='alex',shirt=blue?'#397fca':'#e09c4e',skin=blue?'#d7a378':'#bc8861',hair=blue?'#534138':'#302d31';
    const towardCenter=blue?1:-1;
    return `<g class="person-${name}${isGiver?' is-giver':''}" aria-label="${proper(name)}">
      <rect x="${x-74}" y="53" width="148" height="159" rx="18" fill="${talking?(blue?'#dcecff':'#ffeed7'):'#ebeff4'}" stroke="${talking?(blue?'#286dbd':'#c47c2d'):'#d2dce6'}" stroke-width="${talking?3:1}"/>
      <g class="head">
      ${blue?'':`<path d="M ${x-35} 104 Q ${x-42} 71 ${x-2} 72 Q ${x+39} 71 ${x+35} 102 L ${x+40} 160 Q ${x+24} 166 ${x+19} 145 L ${x-22} 145 Q ${x-30} 165 ${x-40} 159 Z" fill="${hair}"/>`}
      <circle cx="${x}" cy="115" r="32" fill="${skin}"/>
      ${blue?`<path d="M ${x-32} 106 Q ${x-35} 75 ${x} 82 Q ${x+37} 78 ${x+32} 107 Q ${x+4} 90 ${x-32} 106" fill="${hair}"/>`:
      `<path d="M ${x-32} 106 Q ${x-30} 78 ${x} 82 Q ${x+35} 79 ${x+32} 108 L ${x+25} 109 Q ${x+19} 94 ${x+7} 92 Q ${x-10} 106 ${x-32} 106" fill="${hair}"/><circle cx="${x+24}" cy="92" r="4" fill="#9dc8f0"/>` }
      <g class="eyes"><circle cx="${x-11}" cy="119" r="2.5" fill="#3b2c2b"/><circle cx="${x+11}" cy="119" r="2.5" fill="#3b2c2b"/></g>
      <path class="mouth-closed" d="M ${x-10} 133 Q ${x} 140 ${x+10} 133" stroke="#805b4a" stroke-width="2" stroke-linecap="round" fill="none"/>
      <ellipse class="mouth-open" cx="${x}" cy="135" rx="10" ry="7" fill="#793c3d" stroke="#805b4a" stroke-width="1.5"/></g>
      <rect x="${x-42}" y="151" width="84" height="53" rx="15" fill="${shirt}"/>
      <g class="ball-hand"><path d="M ${x+towardCenter*37} 165 Q ${x+towardCenter*57} 155 ${x+towardCenter*72} 156" stroke="${skin}" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="${x+towardCenter*72}" cy="156" r="7" fill="${skin}"/></g>
      <text x="${x}" y="233" text-anchor="middle" font-size="23" font-weight="800" fill="${blue?'#235e9b':'#985817'}">${proper(name)}</text>
      ${talking?`<g class="speaker-tag"><rect x="${x-66}" y="8" width="132" height="33" rx="15" fill="${blue?'#2468b4':'#a65f17'}"/><text x="${x}" y="30" text-anchor="middle" font-size="16" font-weight="800" fill="white">SPEAKING</text></g>`:''}
      <g class="word-bubble" aria-hidden="true"><rect x="${x-48}" y="2" width="96" height="48" rx="17" fill="#ffffff" stroke="${blue?'#2776c8':'#c47c2d'}" stroke-width="3"/><path d="M ${x-12} 50 l12 10 l12 -10" fill="white" stroke="${blue?'#2776c8':'#c47c2d'}" stroke-width="2"/><text class="bubble-word" x="${x}" y="34" text-anchor="middle" font-size="24" font-weight="900" fill="${blue?'#235e9b':'#965814'}"></text></g>
      </g>`;
  }
  function ballScene(theGiver,theSpeaker,showTalking=true) {
    const direction=theGiver==='alex', from=direction?217:423, to=direction?423:217;
    const path=`M ${from} 158 L ${to} 158`;
    const arrow=direction?'416,149 430,158 416,167':'224,149 210,158 224,167';
    return `<svg viewBox="0 0 640 252" role="img" aria-label="${proper(theGiver)} gives the ball to ${proper(other(theGiver))}. ${showTalking?proper(theSpeaker)+' is talking.':''}">
       ${cardPerson(125,'alex',showTalking&&theSpeaker==='alex',theGiver==='alex')}${cardPerson(515,'sam',showTalking&&theSpeaker==='sam',theGiver==='sam')}
       <path d="${path}" stroke="#16855e" stroke-width="7" stroke-linecap="round" fill="none"/>
       <polyline points="${arrow}" class="spark"/>
       <circle id="movingBall" cx="${(from+to)/2}" cy="158" r="21" fill="#f29932" stroke="#bc691b" stroke-width="3"/>
       <path d="M ${(from+to)/2-7} 140 Q ${(from+to)/2+6} 158 ${(from+to)/2-7} 176" stroke="#b46725" stroke-width="2" fill="none"/>
       <text x="320" y="117" text-anchor="middle" font-size="15" font-weight="800" fill="#18714f">BALL MOVES THIS WAY</text>
     </svg>`;
  }
  function animateBall() {
    const ball=$('movingBall'); if(!ball) return;
    clearTimeout(animTimer);
    // Animate only the ball. Speaker changes never change the action arrow.
    const start=giver==='alex'?242:398, end=giver==='alex'?397:243;
    const dur=1000;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){ball.setAttribute('cx',String(end));return;}
    const begin=performance.now();
    document.body.dataset.ballMoving='yes';
    function frame(t) {
      if(ball!==$('movingBall')) return;
      const u=Math.min((t-begin)/dur,1), eased=u*u*(3-2*u);
      ball.setAttribute('cx',String(start+(end-start)*eased));
      ball.setAttribute('cy',String(158-28*Math.sin(Math.PI*eased)));
      if(u<1) animTimer=requestAnimationFrame(frame);
      else delete document.body.dataset.ballMoving;
    }
    animTimer=requestAnimationFrame(frame);
  }
  const clearFeedback=()=>{done=false;hadError=false;openedHint=false;countedError=false;$('feedback').className='feedback hidden';$('feedback').textContent='';$('hint').className='help hidden';$('hint').textContent='';$('nextButton').classList.add('hidden');$('hintButton').classList.remove('hidden');};
  function setupStage(newStage) {
    stopSpeech();
    delete document.body.dataset.ballMoving;
    stage=newStage;clearFeedback();speakerDemo=(stage==='speaker');sub='role';
    document.querySelectorAll('.tab').forEach(el=>el.setAttribute('aria-selected',String(el.dataset.tab===stage)));
    $('kicker').textContent=stages[stage].k;$('heading').textContent=stages[stage].h;$('description').textContent=stages[stage].d;
    render();
  }
  function pickCurrent() {
    if(stage==='action') [giver]=actionTrials[idx.action%actionTrials.length];
    if(stage==='speaker'){giver='alex';speaker=speakerDemo?speaker:speakerTrials[idx.speaker%speakerTrials.length];}
    if(stage==='mix') [giver,speaker]=mixTrials[idx.mix%mixTrials.length];
    if(stage==='listen') [giver,speaker]=listenTrials[idx.listen%listenTrials.length];
    if(stage==='action') speaker='alex';
  }
  function renderScene() {
    const hide=stage==='listen';$('sceneWrap').classList.toggle('hidden',hide);
    $('mainGrid').classList.toggle('split',!hide);
    if(hide) return;
    $('sceneArt').innerHTML=ballScene(giver,speaker,stage!=='action');
    const revealAction = (stage==='speaker') || (stage==='mix' && sub==='sentence') || (done && stage!=='listen');
    $('sceneCaption').innerHTML=revealAction
      ? `<b>${proper(giver)}</b> gives the ball to <b>${proper(other(giver))}</b>.`
      : 'Follow the green arrow to see where the ball goes.';
  }
  function render() {
    pickCurrent();renderScene();$('demo').classList.toggle('hidden',stage!=='speaker'||!speakerDemo);$('practice').classList.toggle('hidden',stage==='speaker'&&speakerDemo);
    $('listenButton').classList.toggle('hidden',stage!=='listen');$('replayButton').classList.toggle('hidden',stage==='listen');
    const totals={action:6,speaker:6,mix:8,listen:8};
    $('progress').textContent=stage==='speaker'&&speakerDemo?'Explore the example':`Question ${(idx[stage]%totals[stage])+1} of ${totals[stage]}`;
    if(stage==='speaker'&&speakerDemo){
      $('alexTalk').setAttribute('aria-pressed',String(speaker==='alex'));$('samTalk').setAttribute('aria-pressed',String(speaker==='sam'));
      $('speakerLabel').textContent=`${proper(speaker).toUpperCase()} SAYS`;
      $('liveSentence').innerHTML=markedPhrase(giver,speaker);
      $('mapping').innerHTML=`<span class="maptag">I / me = ${proper(speaker)}</span><span class="maptag">you = ${proper(other(speaker))}</span>`;
      animateBall();return;
    }
    $('pictureChoices').classList.toggle('hidden',stage!=='listen');$('answerChoices').classList.toggle('hidden',stage==='listen');$('listenPrompt').classList.toggle('hidden',stage!=='listen');
    let question, choices;
    if(stage==='action') {
      const role=actionTrials[idx.action%actionTrials.length][1];
      question=role==='giver'?'Who GIVES the ball?':'Who GETS the ball?';
      choices=[['alex','Alex'],['sam','Mia']];
    } else if(stage==='mix'&&sub==='role') {
      question='Who GIVES the ball?'; choices=[['alex','Alex'],['sam','Mia']];
    } else if(stage==='listen') {
      question='Which picture matches the sentence?';choices=[];
    } else {
      question=`${proper(speaker)} is talking. What does ${proper(speaker)} say?`;
      choices=[['self','I give you the ball.'],['other','You give me the ball.']];
    }
    $('question').textContent=question;
    if(stage==='listen') {
      $('listenPrompt').innerHTML=`<div class="sentence"><div class="speaker-cue"><div class="portrait-wrap">${speakerPortrait(speaker)}<span class="speaker-portrait-word" aria-hidden="true"></span></div><div><div class="small">${proper(speaker).toUpperCase()} IS TALKING</div><div class="big">“${markedPhrase(giver,speaker)}”</div></div></div></div>`;
      const order=idx.listen%2===0?['alex','sam']:['sam','alex'];
      $('pictureChoices').innerHTML=order.map(name=>`<button class="mini-option" data-answer="${name}" aria-label="${proper(name)} gives the ball to ${proper(other(name))}">${smallScene(name)}<span>Choose this picture</span></button>`).join('');
      $('pictureChoices').querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>choose(btn.dataset.answer,btn)));
    } else {
      $('answerChoices').innerHTML=choices.map(([key,label])=>`<button class="choice" data-answer="${key}">${key==='self'||key==='other'?markedPhrase(key==='self'?'alex':'sam','alex'):label}</button>`).join('');
      $('answerChoices').querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>choose(btn.dataset.answer,btn)));
    }
    animateBall();
  }
  function speakerPortrait(name) {
    const blue=name==='alex', skin=blue?'#d7a378':'#bc8861', hair=blue?'#534138':'#302d31', shirt=blue?'#397fca':'#e09c4e';
    return `<svg viewBox="0 0 104 110" role="img" aria-label="${proper(name)} is speaking"><g class="person-${name}">
      <rect x="1" y="1" width="102" height="108" rx="13" fill="${blue?'#e6f1ff':'#fff0da'}"/>
      ${blue?'':`<path d="M 27 40 Q 18 15 52 13 Q 87 15 77 46 L 82 88 Q 68 97 66 75 L 36 75 Q 30 96 20 87 Z" fill="${hair}"/>`}
      <circle cx="52" cy="42" r="25" fill="${skin}"/>
      ${blue?`<path d="M27 37 Q25 12 53 17 Q79 13 77 38 Q52 26 27 37" fill="${hair}"/>`:
      `<path d="M27 37 Q25 12 53 17 Q79 13 77 38 L73 41 Q60 26 52 28 Q43 38 27 37" fill="${hair}"/><circle cx="74" cy="27" r="3" fill="#9dc8f0"/>`}
      <g class="eyes"><circle cx="43" cy="43" r="2.5" fill="#302d31"/><circle cx="61" cy="43" r="2.5" fill="#302d31"/></g>
      <path class="mouth-closed" d="M43 56 Q52 62 61 56" stroke="#805b4a" stroke-width="2" fill="none"/>
      <ellipse class="mouth-open" cx="52" cy="57" rx="9" ry="7" fill="#793c3d" stroke="#805b4a" stroke-width="1.5"/>
      <rect x="21" y="72" width="62" height="46" rx="15" fill="${shirt}"/>
    </g></svg>`;
  }
  function smallScene(theGiver){
    const right=theGiver==='alex',from=right?110:210,to=right?210:110;
    return `<svg viewBox="0 0 320 154" aria-hidden="true"><rect x="8" y="8" width="304" height="135" rx="14" fill="#f2f6fa"/>
      <circle cx="77" cy="56" r="22" fill="#d7a378"/><path d="M55 51 Q56 25 79 33 Q101 31 99 53 Q78 44 55 51" fill="#534138"/><rect x="47" y="80" width="60" height="38" rx="12" fill="#397fca"/>
      <path d="M221 54 Q215 25 244 30 Q274 28 268 55 L275 91 Q264 95 261 77 L225 77 Q225 94 214 91 Z" fill="#302d31"/>
      <circle cx="244" cy="56" r="22" fill="#bc8861"/><path d="M222 51 Q220 30 246 33 Q266 32 266 55 Q245 43 239 43 Q234 50 222 51" fill="#302d31"/><circle cx="261" cy="40" r="3" fill="#9dc8f0"/><rect x="214" y="80" width="60" height="38" rx="12" fill="#e09c4e"/>
      <path d="M${from} 93 L${to} 93" stroke="#16855e" stroke-width="5" stroke-linecap="round"/>
      <polyline points="${right?'202,85 213,93 202,101':'118,85 107,93 118,101'}" fill="none" stroke="#16855e" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="160" cy="93" r="13" fill="#ef9835" stroke="#b46725" stroke-width="2"/>
      <text x="77" y="137" text-anchor="middle" font-size="16" font-weight="800" fill="#255e99">ALEX</text><text x="244" y="137" text-anchor="middle" font-size="16" font-weight="800" fill="#965814">MIA</text></svg>`;
  }
  function correctAnswer(){
    if(stage==='action')return actionTrials[idx.action%actionTrials.length][1]==='giver'?giver:other(giver);
    if(stage==='mix'&&sub==='role')return giver;
    if(stage==='listen')return giver;
    return giver===speaker?'self':'other';
  }
  function errorType(){if(stage==='action'||(stage==='mix'&&sub==='role'))return'action';if(stage==='listen')return'match';return'perspective';}
  function hintMessage(){
    if(stage==='action'||(stage==='mix'&&sub==='role'))return `Follow the green arrow. It starts at ${proper(giver)} and goes to ${proper(other(giver))}. ${proper(giver)} is the giver.`;
    if(stage==='listen')return `“${giver===speaker?'I':'You'}” means ${proper(giver)} here. The ball must start with ${proper(giver)}.`;
    return `${proper(speaker)} is speaking. “I” and “me” mean ${proper(speaker)}. “You” means ${proper(other(speaker))}. The ball goes from ${proper(giver)} to ${proper(other(giver))}.`;
  }
  function choose(answer,button){
    if(done)return;
    if(answer===correctAnswer()){
      done=true;stats.completed++;
      if(hadError||openedHint) stats.helped++;else stats.first++;
      updateStats();
      document.querySelectorAll('#answerChoices button,#pictureChoices button').forEach(el=>el.disabled=true);
      button.classList.add('correct');
      if(stage==='action'||(stage==='mix'&&sub==='role')) {
        $('sceneCaption').innerHTML=`<b>${proper(giver)}</b> gives the ball to <b>${proper(other(giver))}</b>.`;
      }
      let msg;
      if(stage==='action') msg=`Yes! ${proper(giver)} gives the ball to ${proper(other(giver))}.`;
      else if(stage==='mix'&&sub==='role')msg=`Right! ${proper(giver)} gives. Now we can choose the speaker's words.`;
      else if(stage==='listen')msg=`That's right. ${proper(giver)} gives the ball to ${proper(other(giver))}.`;
      else msg=`Correct! ${proper(speaker)} says, “${phrase(giver,speaker)}”`;
      $('feedback').textContent=msg;$('feedback').className='feedback';$('hintButton').classList.add('hidden');
      if(stage==='speaker'||(stage==='mix'&&sub==='sentence')||stage==='listen')say(phrase(giver,speaker),speaker);
      $('nextButton').textContent=stage==='mix'&&sub==='role'?'Next: choose the words →':'Next →';$('nextButton').classList.remove('hidden');
    } else {
      hadError=true;button.classList.add('wrong');
      if(!countedError){stats[errorType()]++;countedError=true;updateStats();}
      $('hint').textContent=hintMessage();$('hint').className='help';
      $('feedback').textContent=(stage==='action'||(stage==='mix'&&sub==='role'))
        ? 'Not quite. Follow the ball from the giver to the receiver. Try again.'
        : stage==='listen'
          ? 'Not quite. Use the speaker and the words to choose the direction. Try again.'
          : 'Not quite. Look at who is speaking, then follow the ball. Try again.';
      $('feedback').className='feedback warn';
      button.disabled=true;
    }
  }
  function next(){
    if(!done)return;
    stopSpeech();
    if(stage==='mix'&&sub==='role')sub='sentence';
    else if(stage==='mix'){idx.mix++;sub='role';}
    else idx[stage]++;
    clearFeedback();render();
  }
  document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>setupStage(btn.dataset.tab)));
  $('alexTalk').addEventListener('click',()=>{speaker='alex';render();say(phrase(giver,speaker),'alex');});
  $('samTalk').addEventListener('click',()=>{speaker='sam';render();say(phrase(giver,speaker),'sam');});
  $('startSpeakerPractice').addEventListener('click',()=>{stopSpeech();speakerDemo=false;clearFeedback();render();});
  $('hearDemo').addEventListener('click',()=>say(phrase(giver,speaker),speaker));
  $('listenButton').addEventListener('click',()=>say(phrase(giver,speaker),speaker));
  $('replayButton').addEventListener('click',animateBall);
  $('nextButton').addEventListener('click',next);
  $('hintButton').addEventListener('click',()=>{if(done)return;if(!openedHint){openedHint=true;stats.hints++;updateStats();}$('hint').textContent=hintMessage();$('hint').className='help';});
  $('resetButton').addEventListener('click',()=>{stopSpeech();Object.keys(stats).forEach(k=>stats[k]=0);idx={action:0,speaker:0,mix:0,listen:0};speakerDemo=true;sub='role';speaker='alex';clearFeedback();updateStats();render();});
  for(const name of ['alex','sam']) {
    $(`${name}Voice`).addEventListener('change',event=>{voicePrefs[name]=event.target.value;stopSpeech();updateVoiceStatus();});
    $(`test${name==='alex'?'Alex':'Sam'}Voice`).addEventListener('click',()=>say(name==='alex'?'I give you the ball.':'You give me the ball.',name));
  }
  if(safeSpeech()){
    window.speechSynthesis.addEventListener?.('voiceschanged',refreshVoices);
    window.addEventListener('pageshow',refreshVoices);
  }
  window.addEventListener('pagehide',stopSpeech);
  refreshVoices();
  // Audio is initiated by a tap/click; listening remains optional where questions might reveal the answer.
  updateStats();setupStage('action');
})();
