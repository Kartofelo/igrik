import React from 'react'; //импорт компонентов из библиотеки реакт
import { Html5Qrcode } from "html5-qrcode"; //импорт библиотеки Html5Qrcode
import { ConfigProvider, Space, Button } from 'antd'; //импорт компонентов из библиотеки АнтДизайн

export default class BarQrScan extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            scanResult: '-',
            loadingText: 'Подождите, загружаем камеру...',
            cameraId: ''
        }
    }

    // функция преднсатройки перед рендером ---------------------------------------------------------------------------
    // (функция componentDidMount() всегда вызывается перед тем как отрисовать страницу)
    // тут идет настройка библиотеки Html5Qrcode, вызова вебкамеры для сканера, описывается что делать когда штрих-код просканеться
    componentDidMount() {
        Html5Qrcode.getCameras().then(devices => {
            /**
             * devices would be an array of objects of type:
             * { id: "id", label: "label" }
             */
            if (devices && devices.length) {
                var cameraId = devices[0].id;
                const html5QrCode = new Html5Qrcode(/* element id */ "reader");
                this.setState({
                    loadingText: 'Готово!'
                });
                html5QrCode.start(
                    cameraId,
                    {
                        fps: 10,    // Optional, frame per seconds for qr code scanning
                        qrbox: { width: 400, height: 200 }  // Optional, if you want bounded box UI
                    },
                    (decodedText, decodedResult) => {
                        this.setState({
                            scanResult: decodedText
                        })
                        this.props.onScanResult(decodedText);
                        html5QrCode.stop().then((ignore) => {

                        }).catch((err) => {
                            // Stop failed, handle it.
                        });
                    },
                    (errorMessage) => {
                        // parse error, ignore it.
                    })
                    .catch((err) => {
                        // Start failed, handle it.
                    });
            }
        }).catch(err => {
            // handle err
        });
    }

    // функция рисует страницу ---------------------------------------------------------------------------
    render() {
        return (
            <div style={{ backgroundColor: '#0000001a' }} className='loaderDiv'>
                <ConfigProvider
                    theme={{
                        token: {
                            colorPrimary: '#00b96b',
                            colorPrimaryBorder: 'red'
                        },
                    }}
                >
                    <Space className='scanDiv' direction="vertical" size={20}>
                        <div id='reader' style={{ width: "500px" }}></div>
                        <Space
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}
                            direction='horizontal'
                            size={10}
                        >
                            {this.state.loadingText}
                            <Button onClick={() => this.props.cancel()} ghost type="primary">Отмена</Button>
                        </Space>
                    </Space>
                </ConfigProvider>
            </div>
        )
    }

}