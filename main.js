// load the model.json file first
tf.loadModel("model/model.json").then(model => {

        // get drawing canvas
        const canvas = document.getElementById('draw');
        const context = canvas.getContext('2d');

        // initialize fabric.js to canvas
        var fab_canvas = this.__canvas = new fabric.Canvas('draw', {
            isDrawingMode: true,
            height: 250,
            width: 250,
            backgroundColor: "white"
        });
        // canvas stroke width
        fab_canvas.freeDrawingBrush.width = 10;

        // prediction function
        function predict() {
            
            // get image from canvas
            let image = context.getImageData(0, 0, 200, 200);

            // create a new canvas and copy the image from drawing canvas
            let new_canvas = document.createElement('canvas');

            // canvas dimensions
            new_canvas.height = 200;
            new_canvas.width = 200;
            new_canvas.getContext('2d').putImageData(image, 0, 0);

            // new resized canvas 28x28
            let resized_canvas = document.createElement('canvas');
            resized_canvas.width = 28;
            resized_canvas.height = 28;
            resized_canvas.getContext('2d').scale(0.14, 0.14);
            resized_canvas.getContext('2d').drawImage(new_canvas, 0, 0);

            // uncomment to view the drawn characters
            // document.body.appendChild(resized_canvas);


            let image_data = resized_canvas.getContext('2d').getImageData(0, 0, 28, 28);

            // change to monochrome
            let monodata = [];
            for (let i = 0, len = image_data.data.length/4; i < len; i += 1) {
                monodata.push(image_data.data[i * 4 + 3]);
                monodata.push(0);
                monodata.push(0);
                monodata.push(0);
            }

            // create imagedata for tfjs
            let monoimgdata = new ImageData(new Uint8ClampedArray(monodata), 28, 28);

            // get image from pixels of monochromatic image
            let input = tf.fromPixels(monoimgdata, 1).reshape([1, 28, 28, 1]).cast('float32').div(tf.scalar(255));
            
            // prediction
            console.log('Prediction started.'); // message
            const predictions = model.predict(input).dataSync(); // prediction
            console.log('Prediction completed.');// message
            
            return predictions;

        }

        function buildchart(predictions) {

            var predictions_arr = [];
            for (var i=0; i<=9; i++) {
                predictions_arr[i] = predictions[i].toFixed(8) * 100;
            }

            var ctx = document.getElementById("prediction_chart").getContext('2d');
            var prediction_chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                    datasets: [{
                        label: '% confidence',
                        data: predictions,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255,99,132,1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        }

        // show prediction on button click and canvas canvas
        document.getElementById('predict').addEventListener('mousedown', e => {
            // clear predictions
            //document.getElementById('predic').innerHTML = "";

            // call prediction function
            var predictions = predict();

            // clear canvas
            document.getElementById('draw').getContext('2d').clearRect(0, 0, 250, 250);
            fab_canvas.clear();

            // build and display prediction chart
            buildchart(predictions);
        });

    });