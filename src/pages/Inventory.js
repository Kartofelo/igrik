// импорт компонентов и файлов ---------------------------------------------------------------------------
import React from 'react'; //импорт компонентов из библиотеки реакт
import { ConfigProvider, Space, Button, Table, Input, InputNumber } from 'antd'; //импорт компонентов из библиотеки АнтДизайн

import Loaders from './components/Loaders';
import ScanProducts from './components/ScanProducts';

import Icon, {
    CameraFilled,
} from '@ant-design/icons';

export default class Inventory extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            timer: '',
            scanStart: false,
            unpacking: false,
            modal: false,
            boxesId: [],
            scanStart: false,
            tooltipText: 'Для распаковки нужно добавить хотя бы одну коробку',
            isLoaded: false,
            table: [],
            boxNum: ''
        }
    }

    getCurrentCounts(id, isWh) {
        let result = 0;
        this.props.data.currentInv[`k_${this.props.userInfo['Комплекс']}`].map((item, index) => {
            if (item['Id остатков'] == id) {
                result = isWh ? item['Остатки на складе'] : item['Остатки в зале'];
            }
        })

        return result;
    }

    componentDidMount() {
        let remains = [];
        // let originalRemains = this.props.data.remains.filter((item) => {
        //     return item['Комплекс'] == this.props.userInfo['Комплекс']
        // })
        let originalRemains = this.props.data.currentInv[`k_${this.props.userInfo['Комплекс']}`];

        originalRemains.map((item, index) => {
            let id = this.props.data.remains[item['Id остатков']]['Id продукта'];
            remains.push({
                "Фото": this.props.data.products[id]['Img'],
                "Id остатков": item['Id остатков'],
                "Артикул": this.props.data.products[id]['Артикул'],
                "Размер": this.props.data.products[id]['Размер'],
                "Название": this.props.data.products[id]['Название'],
                "Записано на складе": item['Остатки на складе']['План'],
                "Факт. на складе": item['Остатки на складе']['Факт'],
                "Записано в зале": item['Остатки в зале']['План'],
                "Факт. в зале": item['Остатки в зале']['Факт'],
                "Цена": this.props.data.products[id]['Цена'],
                "key": index
            })
        })

        this.setState({
            table: remains,
            isLoaded: true
        })
    }

    filterTable() {
        let result = this.state.table;
        return result;
    }

    changeCount(ind, val, par) {
        let data = this.state.table;

        data[ind][par] = val;

        this.setState({
            table: data
        })
        this.allSave();
    }

    renderTable() {
        // 1 - тут формируется структура столбцов от полученных данных из FireBase
        let column = [];
        for (let key in this.state.table[0]) {
            if (key != 'key' && key != 'Id остатков') {
                switch (key) {
                    case "Фото":
                        column.push({
                            title: key,
                            dataIndex: key,
                            key: key,
                            render: (key) => <img src={`../items/${key}.png`} />
                        })
                        break;

                    case "Факт. на складе":
                        column.push({
                            title: key,
                            dataIndex: key,
                            key: key,
                            render: (key, record, index) => <InputNumber onChange={(val) => this.changeCount(index, val, "Факт. на складе")} name={key} value={this.state.table[index]["Факт. на складе"]} min={0} />
                        })
                        break;

                    case "Факт. в зале":
                        column.push({
                            title: key,
                            dataIndex: key,
                            key: key,
                            render: (key, record, index) => <InputNumber onChange={(val) => this.changeCount(index, val, "Факт. в зале")} name={key} value={this.state.table[index]["Факт. в зале"]} min={0} />
                        })
                        break;

                    default:
                        column.push({
                            title: key,
                            dataIndex: key,
                            key: key,
                        })
                        break;
                }
            }
        }

        // 2 - тут отрисовывается таблица которую возвращает функция "filterTable()" (ее описал выше)
        return (
            <Table
                className='tableStyle'
                columns={column}
                dataSource={this.filterTable()}
            />
        )
    }

    checkArt(art, arr) {
        let result = -1;
        arr.map((item, index) => {
            if (item.art == art)
                result = item.count
        })
        return result
    }

    allSave() {
        let newData = this.props.data;

        this.state.table.map((item, index) => {
            newData.currentInv[`k_${this.props.userInfo['Комплекс']}`][index]['Остатки в зале']['Факт'] = item['Факт. в зале'];
            newData.currentInv[`k_${this.props.userInfo['Комплекс']}`][index]['Остатки на складе']['Факт'] = item['Факт. на складе'];
        });

        this.props.dataUpdate(newData);
    }

    save(val, id) {
        let table = this.state.table;
        let str = id == 0 ? 'Факт. на складе' : 'Факт. в зале';
        table.map((item, index) => {
            if (this.checkArt(item['Артикул'], val) != -1) {
                table[index][str] += this.checkArt(item['Артикул'], val);
            }
        })

        this.setState({
            scanStart: false,
            table: table
        })
        this.allSave();
    }

    modalWindow() {
        if (this.state.modal) {
            return (
                <div style={{ backgroundColor: '#0000001a' }} className='loaderDiv'>
                    <Space style={{ width: '500px' }} className='scanDiv' direction="vertical" size={30}>
                        <h3 style={{ margin: '0px' }}>Вы уверены?</h3>
                        Инвентаризация завершится у всех сотрудников
                        <Space direction="horizontal" size={10}>
                            <Button onClick={() => this.complete()} type="primary">Сохранить</Button>
                            <Button onClick={() => this.setState({ modal: false })} ghost type="primary">Отмена</Button>
                        </Space>
                    </Space>
                </div>
            )
        } else return null
    }

    complete() {
        let newData = this.props.data;

        this.state.table.map((item, index) => {
            if ((item['Записано на складе'] != item['Факт. на складе']) || (item['Записано в зале'] != item['Факт. в зале'])) {
                newData.archiveInv.push({
                    "Id остатков": item['Id остатков'],
                    "Инвентаризация": this.props.inventId,
                    "Кол-во в записи": item['Записано на складе'] + item['Записано в зале'],
                    "Кол-во подтвержденных": item['Факт. на складе'] + item['Факт. в зале']
                })

                newData.remains[item['Id остатков']]['Остатки в зале'] = item['Факт. в зале'];
                newData.remains[item['Id остатков']]['Остатки на складе'] = item['Факт. на складе'];
            }
        })

        delete newData.currentInv[`k_${this.props.userInfo['Комплекс']}`];

        console.log(this.props.inventId);
        newData.inventory[this.props.inventId]['Статус'] = "Завершен";

        this.setState({
            modal: false
        })
        this.props.dataUpdate(newData);
        this.props.refresh();
    }

    render() {
        return (
            <div>
                {
                    this.state.isLoaded ?
                        <ConfigProvider
                            theme={{
                                token: {
                                    colorPrimary: '#00b96b',
                                    colorPrimaryBorder: 'red',
                                    colorFillSecondary: 'red'
                                },
                            }}
                        >
                            {
                                this.state.scanStart ?
                                    <ScanProducts
                                        cancel={() => this.setState({ scanStart: false })}
                                        invent={true}
                                        data={this.props.data}
                                        userInfo={this.props.userInfo}
                                        mesTest={(type, mes) => { this.props.mesTest(type, mes) }}
                                        save={(val, id) => this.save(val, id)}
                                    />
                                    :
                                    ''
                            }
                            <Space direction="vertical">
                                <h2>До конца инвентаризации {this.props.timer}</h2>
                                <Space direction='horizontal'>
                                    {this.props.userInfo.Admins ? <Button type="primary" onClick={() => this.setState({ modal: true })} >Завершить</Button> : ''}
                                    <Button type="primary" ghost onClick={() => this.setState({ scanStart: true })} icon={<CameraFilled />}>Сканировать</Button>
                                </Space>
                                {this.renderTable()}
                                {this.modalWindow()}
                            </Space>
                        </ConfigProvider>
                        :
                        <Loaders />
                }
            </div>
        );
    }

}