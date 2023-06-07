import React from 'react'; //импорт компонентов из библиотеки реакт
import { Html5Qrcode } from "html5-qrcode";
import { ConfigProvider, Space, Button, Select } from 'antd'; //импорт компонентов из библиотеки АнтДизайн
import Item from 'antd/es/list/Item';

export default class ScanProducts extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scanStart: false,
            scanResult: '-',
            loadingText: 'Подождите, загружаем камеру...',
            productsInfo: [],
            selectVal: 0
        }
    }

    productComponent(img, art, name, count, ind) {
        // console.log(art);
        return (
            <Space
                className='productsCounts'
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    // width: '500px'
                }}
                direction='horizontal'
                size={10}
                key={ind}
            >
                {/* <img src={`../items/${img}.png`} /> */}
                {/* {art} */}
                {name} - {count} шт
            </Space>
        )
    }

    scanEnd(val) {
        let itemExistence = false;
        let productsInfo = this.state.productsInfo;

        productsInfo.map((item, index) => {
            if(item.art == val) {
                itemExistence = true;
                productsInfo[index].count++;
            }
        })
        
        if(!itemExistence) {
            let products = this.props.data.products;
            // console.log(products);
            products.map((item,index) => {
                if(item['Артикул'] == val) {
                    productsInfo.push({
                        img: item.Img,
                        art: val,
                        name: item['Название'],
                        count: 1
                    })
                }
            })
        }

        this.setState({
            productsInfo: productsInfo
        })
    }

    scanSctart() {
        this.setState({scanStart: true})
        Html5Qrcode.getCameras().then(devices => {
            /**
             * devices would be an array of objects of type:
             * { id: "id", label: "label" }
             */
            if (devices && devices.length) {
                var cameraId = devices.length == 1 ? devices[0].id : devices[1].id;
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
                        this.scanEnd(decodedText);
                        html5QrCode.stop().then((ignore) => {
                            this.setState({scanStart: false})
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

    componentDidMount() {
        this.scanSctart();
    }

    renderBut() {
        if(this.props.invent) {
            return (
                <Space direction='horizontal'>
                    <Select
                        style={{
                            width: '90px'
                        }}
                        value={this.state.selectVal}
                        onChange={(val) => this.setState({selectVal: val})}
                        options={
                            [
                                {
                                    value: 0,
                                    label: 'В склад',
                                },
                                {
                                    value: 1,
                                    label: 'В зал',
                                }
                            ]
                        }
                    />
                    <Button onClick={() => this.props.save(this.state.productsInfo, this.state.selectVal)} disabled={this.state.productsInfo.length === 0} type="primary">Загрузить</Button>
                </Space>
            )
        } else {
            return <Button onClick={() => this.props.save(this.state.productsInfo)} disabled={this.state.productsInfo.length === 0} type="primary">Загрузить</Button>
        }
    }

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
                    <Space className='scanDiv' direction="horizontal" size={20}>
                        <Space direction="vertical" size={20}>
                            <div style={{ width: "500px", height: "375px", backgroundColor: 'black' }}>
                                <div id='reader' style={{ width: "500px" }}></div>
                            </div>
                            <Space
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}
                                direction='horizontal'
                                size={10}
                            >
                                {this.renderBut()}
                                <Button onClick={() => this.scanSctart()} disabled={this.state.scanStart} type="primary">Сканировать еще</Button>
                                <Button onClick={() => this.props.cancel()} ghost type="primary">Отмена</Button>
                            </Space>
                        </Space>
                        {
                            
                            <Space direction="vertical" size={20}>
                                {
                                    this.state.productsInfo.map((item,index) => {
                                        return this.productComponent(item.img,item.art,item.name, item.count, index)
                                    })
                                }
                            </Space>
                        }
                    </Space>
                </ConfigProvider>
            </div>
        )
    }
}