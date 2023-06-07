import React from 'react'; //импорт компонентов из библиотеки реакт
import { ConfigProvider, Space, Input, Button, Table, Tooltip } from 'antd'; //импорт компонентов из библиотеки АнтДизайн
import Icon, {
    CameraFilled,
} from '@ant-design/icons'; //импорт иконок из библиотеки АнтДизайн

import BarQrScan from './components/BarQrScan';
import AddRemains from './components/AddRemains_ADeliveries';

export default class ADeliveries extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            unpacking: false,
            boxesId: [],
            scanStart: false,
            tooltipText: 'Для распаковки нужно добавить хотя бы одну коробку',
            isLoaded: false,
            table: [],
            boxNum: ''
        }
    }

    onChangeFilters = (tg, e) => {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({ [name]: value });
    }

    addBox(num) {
        let table = this.state.table;
        let check = true;
        let boxItems = null;
        table.map((item, index) => {
            if(item['Номер коробки'] == num)
                check = false;
        })

        if(check) {
            let data = this.props.data.boxes;
            
            data.map((item, index) => {
                if(item['Номер отправки'] == num) boxItems = item;
            })

            if(boxItems === null) {
                this.props.mesTest('error', "Коробка не найдена :(")
            } else {
                table.push({
                    '№': table.length,
                    'Номер коробки': boxItems['Номер отправки'],
                    'Дата': boxItems['Дата'],
                    key: table.length
                })

                this.setState({
                    table: table,
                    boxNum: ''
                })
            }
        } else {
            this.props.mesTest('error', "Эта коробка уже добавлена")
        }
    }

    filterTable() {
        let result = this.state.table;
        return result;
    }

    renderTable() {
        // 1 - тут формируется структура столбцов от полученных данных из FireBase
        let column = [
            {
                title: '№',
                dataIndex: '№',
                key: 0,
                width: '10px'
            },
            {
                title: 'Номер коробки',
                dataIndex: 'Номер коробки',
                key: 1,
            },
            {
                title: 'Дата',
                dataIndex: 'Дата',
                key: 2,
            }
        ];
        
        const source = this.state.table

        // 2 - тут отрисовывается таблица которую возвращает функция "filterTable()" (ее описал выше)
        return (
            <Table
                // className='tableStyle'
                style={{
                    width:'50vw'
                }}
                columns={column}
                dataSource={[...source]}
                rowKey={this.state.table.key}
            />
        )
    }

    unpacking() {
        let boxNumbers = [];
        let boxesId = [];

        this.state.table.map((item,index) => {
            boxNumbers.push(item['Номер коробки'])
        })

        this.props.data.boxes.map((item,index) => {
            if(boxNumbers.indexOf(item['Номер отправки']) != -1)
                boxesId.push(item['id']);
        })

        this.setState({
            boxesId: boxesId,
            unpacking: true
        })
    }

    renderMain() {
        return(
            <ConfigProvider
                    theme={{
                        token: {
                            colorPrimary: '#00b96b',
                            colorPrimaryBorder: 'red'
                        },
                    }}
                >
                    <Space direction="vertical">
                        <Button type="primary" onClick={() => this.props.back()} ghost style={{ marginTop: '15px' }}>Назад</Button>
                        <h2>Принятие поставки</h2>
                        <Space direction='horizontal' size={10}>
                            <Button onClick={() => {this.setState({scanStart: true})}} icon={<CameraFilled />} ghost type="primary"/>
                            <Input value={this.state.boxNum} onChange={this.onChangeFilters.bind(this, 1)} name="boxNum" placeholder="Номер коробки" />
                            <Button onClick={() => this.addBox(this.state.boxNum)} disabled={this.state.boxNum == ''} type="primary">Добавить</Button>
                        </Space>
                        {this.renderTable()}
                        <Tooltip placement="bottom" title={this.state.tooltipText}>
                            <Button onClick={() => {this.unpacking()}} disabled={this.state.table.length === 0} type="primary">Распаковать</Button>
                        </Tooltip>
                    </Space>
                </ConfigProvider>
        )
    }

    unpackingCancel(){
        this.setState({
            unpacking: false,
            boxesId: [],

        })
    }

    finish() {
        this.setState({
            unpacking: false,
            boxesId: [],
            scanStart: false,
            tooltipText: 'Для распаковки нужно добавить хотя бы одну коробку',
            isLoaded: false,
            table: [],
            boxNum: ''
        })

        this.props.mesTest('success', "Коробка была удачно распакована :)");
    }

    render() {
        return (
            <div>
                { 
                    this.state.scanStart ? 
                    <BarQrScan 
                        cancel={() => this.setState({scanStart: false})} 
                        onScanResult={
                            (val) => {
                                this.setState({
                                    boxNum: val, 
                                    scanStart: false
                                })
                            }
                        }
                    /> 
                    : 
                    '' 
                }
                {
                    this.state.unpacking ? 
                        <AddRemains 
                            finish = {() => this.finish()}
                            dataUpdate = {(data) => this.props.dataUpdate(data)}
                            data={this.props.data} 
                            userInfo={this.props.userInfo} 
                            boxes={this.state.boxesId}
                            cancel={() => this.unpackingCancel()}
                        /> 
                    : 
                        this.renderMain()
                }
            </div>
        )
    }

}