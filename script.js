document.addEventListener('DOMContentLoaded', () => { // HTMLが準備できてから実行
    (function() { // スコープの隔離（定義された変数が他と混ざらないようにする）ここから↓
        const whiteKeys = document.querySelectorAll('.white-key'); // HTMLの中からwhite-keyの要素をすべて取得する
        const blackKeys = document.querySelectorAll('.black-key'); // HTMLの中からblack-keyの要素をすべて取得する
        const activeWhiteColor = 'lightgray'; // 白鍵が押されたときの色
        const activeBlackColor = 'saddlebrown'; // 黒鍵が押されたときの色

        const dropZone = document.getElementById('drop-zone'); // "ドロップゾーン"を探す
        const imageContainer = document.getElementById('image-container'); // 画像を置く"箱"を探す

        dropZone.addEventListener('dragover', (e) => { // ドロップゾーンの上で何かをドラッグしていたら下のコードを実行
        e.preventDefault(); // ファイルを"新しいタブ"などで開かないようにする
        dropZone.classList.add('highlight'); // ドロップゾーンの見た目を変えるためにcssがわかる名前を付ける
        });

        dropZone.addEventListener('dragleave', (e) => { // ドラッグがドロップゾーンの上から外れたら下のコードを実行
        e.preventDefault(); // ファイルを"新しいタブ"などで開かないようにする
        dropZone.classList.remove('highlight'); // ドラッグ中につけた名前を外す
        });

        dropZone.addEventListener('drop', (e) => { // ドロップしたら下のコードを実行
        e.preventDefault(); // "新しいタブで開く"などのデフォルトの動作を無効化
        dropZone.classList.remove('highlight'); // ドラッグ中につけていた名前を外す
        const files = e.dataTransfer.files; // ドロップされた情報を"files"に入れる
        if (files.length > 0) { // ファイルが一つ以上かを確認
            const file = files[0]; // ドロップされたファイルリストの最初のファイルを取る
            if (file.type.startsWith('image/')) { // 取ったファイルが画像かどうかを判断
                const reader = new FileReader(); // ファイルを読み込むための道具(FileReader)を用意
                reader.onload = (event) => { // ファイルを読み込めた時の動作
                    const img = new Image(); // 画像を貼り付けるためのHTMLタグを作成
                    img.src = event.target.result; // 読み込んだデータURLを"画像の場所"として設定→ウェブ上で表示できる
                    imageContainer.innerHTML = ''; // 画像を表示する場所の中身を一回無くす
                    imageContainer.appendChild(img); // 無くしたところに画像を入れて表示
                    dropZone.style.display = 'none'; // ドロップゾーンの役割が終わったから非表示にする
                    imageContainer.style.display = 'flex'; // 画像を中央に配置
                };
            reader.readAsDataURL(file); // ファイルの内容をデータURLで読み込む
        }
        else {alert('画像ファイルのみドロップ可能です。');} // 画像ファイルではなかったら警告を表示
        }
        });

        let isMouseDown = false; // マウスが押されていない状態＝初期状態をfalseとする
        let audioContext; // 鍵盤が押されたら作られる
        const activeOscillators = {}; // あとで止めるためにどの鍵盤が鳴っているか記録する

        document.body.addEventListener('mousedown', () => {
            isMouseDown = true; // どこかでマウスが押されたらisMouseDownをtrueにする
        });

        document.body.addEventListener('mouseup', () => {
            isMouseDown = false; // どこかでマウスが離されたらisMouseDownをfalseにする
            for (const note in activeOscillators) {
                if (activeOscillators[note]) {
                    const { oscillator, gainNode } = activeOscillators[note];
                    const now = audioContext.currentTime;
                    gainNode.gain.cancelScheduledValues(now);
                    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
                    oscillator.stop(now + 0.11);
                }
            }
        });

        const noteFrequencies = { // 各鍵盤のそれぞれの周波数
            '-4A': 27.50,
            '-4B': 29.14,
            '-4H': 30.87,

            '-3C': 32.70,
            '-3Des': 34.65,
            '-3D': 36.71,
            '-3Es': 38.89,
            '-3E': 41.20,
            '-3F': 43.65,
            '-3Ges': 46.25,
            '-3G': 48.99,
            '-3As': 51.91,
            '-3A': 55.00,
            '-3B': 58.27,
            '-3H': 61.74,

            '-2C': 65.41,
            '-2Des': 69.30,
            '-2D': 73.42,
            '-2Es': 77.78,
            '-2E': 82.41,
            '-2F': 87.31,
            '-2Ges': 92.50,
            '-2G': 97.99,
            '-2As': 103.83,
            '-2A': 110.00,
            '-2B': 116.54,
            '-2H': 123.47,

            '-1C': 130.81,
            '-1Des': 138.59,
            '-1D': 146.83,
            '-1Es': 155.56,
            '-1E': 164.81,
            '-1F': 174.61,
            '-1Ges': 185.00,
            '-1G': 196.00,
            '-1As': 207.65,
            '-1A': 220.00,
            '-1B': 233.08,
            '-1H': 246.94,

            '0C': 261.63,
            '0Des': 277.18,
            '0D': 293.66,
            '0Es': 311.13,
            '0E': 329.63,
            '0F': 349.23,
            '0Ges': 369.99,
            '0G': 392.00,
            '0As': 415.30,
            '0A': 440.00,
            '0B': 466.16,
            '0H': 493.88,

            '1C': 523.25,
            '1Des': 554.37,
            '1D': 587.33,
            '1Es': 622.25,
            '1E': 659.26,
            '1F': 698.46,
            '1Ges': 739.99,
            '1G': 783.99,
            '1As': 830.61,
            '1A': 880.00,
            '1B': 932.33,
            '1H': 987.77,

            '2C': 1046.50,
            '2Des': 1108.73,
            '2D': 1174.66,
            '2Es': 1244.51,
            '2E': 1318.51,
            '2F': 1396.91,
            '2Ges': 1479.98,
            '2G': 1567.98,
            '2As': 1661.22,
            '2A': 1760.00,
            '2B': 1864.66,
            '2H': 1975.53,

            '3C': 2093.00,
            '3Des': 2217.46,
            '3D': 2349.32,
            '3Es': 2489.02,
            '3E': 2637.02,
            '3F': 2793.83,
            '3Ges': 2959.96,
            '3G': 3135.96,
            '3As': 3322.44,
            '3A': 3520.00,
            '3B': 3729.31,
            '3H': 3951.07,

            '4C': 4186.01
        };


        const keyToNoteMap = { // 特定の音が出るキーを割り当てる
            'a': '0C',
            'w': '0Des',
            's': '0D',
            'e': '0Es',
            'd': '0E',
            'f': '0F',
            't': '0Ges',
            'g': '0G',
            'y': '0As',
            'h': '0A',
            'u': '0B',
            'j': '0H',
        };





        function setKeyColor(key, color) { // 操作対象の鍵盤(key)と色(color)を受け取る
            key.style.backgroundColor = color; // cssの鍵盤の色を受け取った色に設定
        }

        function startNote(note) {
            const frequency = noteFrequencies[note]; // 音の名前に対応する周波数を見つける

            // audiocontext(音を扱う基盤)がなかったら作る
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            // 音の周波数が見つからなかったり、すでに同じ音が鳴っていたら鳴らさないようにする
            if (!frequency || activeOscillators[note]) {
                return;
            }

            const oscillator = audioContext.createOscillator(); // オシレーター(音の波形を作る部分)を作る
            const gainNode = audioContext.createGain(); // ゲインノード(音量制御)を作る

            // 音の設定と経路の接続
            oscillator.type = 'sine'; // 波形の設定
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime); // 周波数の設定
            gainNode.gain.setValueAtTime(1.0, audioContext.currentTime); // 音量の設定(1.0が最大)
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination); // 音の信号の経路を設定

            // 再生開始と状態保存
            oscillator.start(0); // 音を鳴らし始める
            activeOscillators[note] = { oscillator, gainNode }; // 音がなっている状態を記録
            
            // 停止後のクリーンアップ
            oscillator.onended = () => { delete activeOscillators[note]; }; // 音が止まった時に記録を削除
        }



        function stopNote(note, duration = 0.2) {
            if (activeOscillators[note]) { // 音がなっていなければ処理しない
                const { oscillator, gainNode } = activeOscillators[note]; // 鳴っている音を取得
                const now = audioContext.currentTime;
                
                // フェードアウト処理
                gainNode.gain.cancelScheduledValues(now); // 音量設定がケンカしないように変化予定をキャンセル
                gainNode.gain.setValueAtTime(gainNode.gain.value, now); // 今の音量を確定させる
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration); // 音量減衰
                
                // 音量が下がった後にオシレーターを停止
                oscillator.stop(now + duration + 0.01); 
            }
        }



        function addListenersToKeys(keys, activeColor) {
            const originalColors = {}; // 鍵盤の元の色を保存するところ

            keys.forEach(key => { // すべての鍵盤に対して以下を実行
                originalColors[key] = getComputedStyle(key).backgroundColor; // 元の色を保存
                const note = key.dataset.note;
                
                // --- 発音と色変更をセットで行うロジック ---
                const activateKey = () => {
                    setKeyColor(key, activeColor);
                    startNote(note); // 音を鳴らす関数を呼び出す
                };

                // --- 消音と色戻しをセットで行うロジック ---
                const deactivateKey = (duration = 0.2) => {
                    setKeyColor(key, originalColors[key]);
                    stopNote(note, duration); // 音を止める関数を呼び出す
                };

                key.addEventListener('mousedown', activateKey); // 鍵盤が押されたらactivateKeyを実行

                key.addEventListener('mouseup', () => deactivateKey(0.2)); // 鍵盤が離されたらdeactivateKeyを実行

                // マウスを押したまま鍵盤から外れた時は早めに消す
                key.addEventListener('mouseout', () => {
                    if (isMouseDown) {
                        deactivateKey(0.1); 
                    } else {
                        setKeyColor(key, originalColors[key]);
                    }
                });

                // マウスが押されたまま鍵盤に入った時もactivateKeyを実行
                key.addEventListener('mouseenter', () => {
                    if (isMouseDown) {
                        activateKey();
                    }
                });


                
            function handleKeyPressAndPlay(event) {
                // 1. キーが押されたことを検知し、キー名を取得
                const keyName = event.key.toLowerCase();
                
                // 2. 音符名（鍵盤名）への変換
                const note = keyToNoteMap[keyName];

                // 割り当てられたキーであり、かつ、まだ押されていない場合のみ処理
                if (note && !activeKeys[keyName]) {
                    event.preventDefault(); 
                    
                    // 状態を記録して、押しっぱなしによる重複再生を防ぐ
                    activeKeys[keyName] = true; 

                    // 3. 周波数の取得 (startNote内部で行われるため、ここでは noteNameがあれば十分)
                    //    (noteFrequencies[note] の参照は startNote() 関数内で行われます)
                    
                    // 4. 音の再生（発音）
                    startNote(note); 

                    // 併せて、画面上の鍵盤の色を変更する処理
                    const keyElement = noteToKeyElementMap[note]; 
                    if (keyElement) {
                        // activeColor (例: 'red')
                        setKeyColor(keyElement, 'red'); 
                    }
                }
            }

            // キーボードが押された時に実行するリスナー
            window.addEventListener('keydown', handleKeyPressAndPlay);



            });
        }







        
     









        addColorChangeAndSoundListeners(whiteKeys, activeWhiteColor); // すべての白鍵にこれらを適用
        addColorChangeAndSoundListeners(blackKeys, activeBlackColor); // すべての黒鍵にこれらを適用
    })(); // スコープの隔離（定義された変数が他と混ざらないようにする）ここまで↑
});