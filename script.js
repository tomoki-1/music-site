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
                img.style.maxWidth = '100%'; // 表示する画像のサイズやレイアウトを調整
                img.style.display = 'block'; // 同じ↑
                imageContainer.innerHTML = ''; // 画像を表示する場所の中身を一回無くす
                imageContainer.appendChild(img); // 無くしたところに画像を入れて表示
                dropZone.style.display = 'none'; // ドロップゾーンの役割が終わったから非表示にする
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

        function addColorChangeAndSoundListeners(keys, activeColor) {
            const originalColors = {}; // 各鍵盤の元の色を保存するための箱
            keys.forEach(key => { // 取得した鍵盤を一つずつ処理
                originalColors[key] = getComputedStyle(key).backgroundColor; // 各鍵盤の元の色を保存する

                key.addEventListener('mousedown', () => { // 鍵盤の上でマウスが押されたとき
                    if (!audioContext) {audioContext = new (window.AudioContext || window.webkitAudioContext)();} // 初めてクリックしたときにまだaudioContextが作られていなければそのときに作る
                    key.style.backgroundColor = activeColor; // 鍵盤の色を設定されている色（activeColor）に変える
                    const note = key.dataset.note;
                    const frequency = noteFrequencies[note]; // クリックされた鍵盤をHTMLの鍵盤のところのdata-noteから見つけて対応する音の周波数を見つける
                    if (frequency && !activeOscillators[note]) { // もしそれが見つかって、その音が鳴っていない状態なら、音を鳴らすための処理に進む
                        const oscillator = audioContext.createOscillator(); // 音の波形を生成するWeb Audio APIの部品（オシレーター）を作成
                        const gainNode = audioContext.createGain(); // 音量を制御する部品（ゲインノード）を作成
                        oscillator.type = 'Sawtooth'; // オシレーターが生成する音の波形を設定
                        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime); // オシレーターに各鍵盤に対応する周波数を設定
                        gainNode.gain.setValueAtTime(1.0, audioContext.currentTime); // ゲインノードの初期音量を1.0に設定（最大音量）
                        oscillator.connect(gainNode); gainNode.connect(audioContext.destination); // 音の信号が流れる経路を設定（オシレーター → ゲインノード → スピーカー）
                        oscillator.start(0); // 音の再生をすぐに開始
                        activeOscillators[note] = { oscillator, gainNode }; // 再生中のオシレーターとゲインノードのペアをactiveOscillatorsに保存
                        oscillator.onended = () => {delete activeOscillators[note];}; // オシレーターが完全に停止したらactiveOscillatorsからその記録を削除
                    }
                });

                key.addEventListener('mouseup', () => { // 鍵盤の上でマウスが離されたとき
                    key.style.backgroundColor = originalColors[key]; // 鍵盤の色をoriginalColorsに保存してある色に戻す
                    const note = key.dataset.note;
                    if (activeOscillators[note]) { // もしその鍵盤の音がactiveOscillatorsに保存されていて鳴っていたら停止処理を行う
                        const { oscillator, gainNode } = activeOscillators[note];
                        const now = audioContext.currentTime;
                        gainNode.gain.cancelScheduledValues(now);
                        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
                        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2); // 音量をゆっくり下げる
                        oscillator.stop(now + 0.21); // 音量が下がった後にオシレーターを停止
                    }
                });

                key.addEventListener('mouseout', () => { // マウスが鍵盤の外に出たとき
                    key.style.backgroundColor = originalColors[key]; // 鍵盤の色をoriginalColorsに保存してある色に戻す
                    const note = key.dataset.note;
                    if (activeOscillators[note] && isMouseDown) { // マウスが押されたままでその音がなっていたらその音を消す
                        const { oscillator, gainNode } = activeOscillators[note];
                        const now = audioContext.currentTime;
                        gainNode.gain.cancelScheduledValues(now);
                        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
                        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1); // さっきよりも早めに音量を下げる
                        oscillator.stop(now + 0.11); // 音量が下がった後にオシレーターを停止
                    }
                });

                key.addEventListener('mouseenter', () => { // マウスが鍵盤に入ってきたとき
                    if (isMouseDown) { // もしマウスが押されたままその鍵盤に入ってきたら次の処理を実行
                        key.style.backgroundColor = activeColor; // 鍵盤の色を設定されている色（activeColor）に変える
                        const note = key.dataset.note;
                        const frequency = noteFrequencies[note]; // クリックされた鍵盤をHTMLの鍵盤のところのdata-noteから見つけて対応する音の周波数を見つける
                        if (frequency && !activeOscillators[note]) { // もしそれが見つかって、その音が鳴っていない状態なら、音を鳴らすための処理に進む
                            const oscillator = audioContext.createOscillator(); // 音の波形を生成するWeb Audio APIの部品（オシレーター）を作成
                            const gainNode = audioContext.createGain(); // 音量を制御する部品（ゲインノード）を作成
                            oscillator.type = 'sine'; // オシレーターが生成する音の波形を設定
                            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime); // オシレーターに各鍵盤に対応する周波数を設定
                            gainNode.gain.setValueAtTime(1.0, audioContext.currentTime); // ゲインノードの初期音量を1.0に設定（最大音量）
                            oscillator.connect(gainNode); gainNode.connect(audioContext.destination); // 音の信号が流れる経路を設定（オシレーター → ゲインノード → スピーカー）
                            oscillator.start(0); // 音の再生をすぐに開始
                            activeOscillators[note] = { oscillator, gainNode }; // 再生中のオシレーターとゲインノードのペアをactiveOscillatorsに保存
                            oscillator.onended = () => {delete activeOscillators[note];}; // オシレーターが完全に停止したらactiveOscillatorsからその記録を削除
                        }
                    }
                });
            });
        }

        addColorChangeAndSoundListeners(whiteKeys, activeWhiteColor); // すべての白鍵にこれらを適用
        addColorChangeAndSoundListeners(blackKeys, activeBlackColor); // すべての黒鍵にこれらを適用
    })(); // スコープの隔離（定義された変数が他と混ざらないようにする）ここまで↑
});