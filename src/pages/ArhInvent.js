import React from 'react'; //импорт компонентов из библиотеки реакт
import { ConfigProvider, Space, Button, Table, Input, Radio } from 'antd'; //импорт компонентов из библиотеки АнтДизайн
import { useState } from 'react';

import Loaders from './components/Loaders';
import Inventory from './Inventory';
import { push } from 'firebase/database';


export default class ArhInvent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentInvent: null,
            currentId: null,
            currentOpen: false,
            timer: '',
            isLoaded: false,
            modal: false,
            typeVal: 0,
            table: {}
        }
    }

    modalWindow() {

        const onChangeRadio = (e) => {
            this.setState({
                typeVal: e.target.value
            })
        };

        if (this.state.modal) {
            return (
                <div style={{ backgroundColor: '#0000001a' }} className='loaderDiv'>
                    <Space style={{ width: '500px' }} className='scanDiv' direction="vertical" size={30}>
                        <h3 style={{ margin: '0px' }}>Выберите вид</h3>
                        <Radio.Group onChange={onChangeRadio} value={this.state.typeVal}>
                            {
                                this.props.data.manCategories.map((item,index) => {
                                    return <Radio key={index} value={index}>{item['Название']}</Radio>
                                })
                            }
                        </Radio.Group>
                        <Space direction="horizontal" size={10}>
                            <Button onClick={() => {this.newInventory()}} type="primary">Начать</Button>
                            <Button onClick={() => this.setState({ modal: false })} ghost type="primary">Отмена</Button>
                        </Space>
                    </Space>
                </div>
            )
        } else return null
    }

    getStandartDate(withTime) {
        let date = new Date();

        let dateObj = {
            y: date.getFullYear(),
            m: (date.getMonth()).toString() == 2 ? date.getMonth() : `0${date.getMonth()}`,
            d: (date.getDate()).toString() == 2 ? date.getDate() : `0${date.getDate()}`,

            h: date.getHours(),
            mi: date.getMinutes(),
            s: date.getSeconds()
        }

        let strDate = `${dateObj.y}/${dateObj.m}/${dateObj.d}`
        let strTime = `${dateObj.h}:${dateObj.mi}:${dateObj.s}`

        return `${strDate} ${withTime ? strTime : ''}`
    }

    newInventory() {
        let newData = this.props.data;
        let filterRemains = this.props.data.remains.filter((item) => {
            return (item['Комплекс'] == this.props.userInfo['Комплекс']) && (this.props.data.products[item['Id продукта']]['Категория'] == this.state.typeVal)
        })
        let currentId = newData.inventory.length;

        newData.inventory.push({
            "id": currentId,
            "Дата": this.getStandartDate(false),
            "Категория": 0,
            "Комплекс": 0,
            "Статус": this.getStandartDate(true)
        });

        this.setState({
            currentInvent: this.getStandartDate(true)
        })

        newData.currentInv[`k_${this.props.userInfo['Комплекс']}`] = [];

        filterRemains.map((item,index) => {
            newData.currentInv[`k_${this.props.userInfo['Комплекс']}`].push({
                "Id остатков": item.id,
                "Остатки в зале": {
                    "План": item['Остатки в зале'],
                    "Факт": 0
                },
                "Остатки на складе": {
                    "План": item['Остатки на складе'],
                    "Факт": 0
                }
            })
        })

        this.props.dataUpdate(newData);
        this.startTimer();
        this.setState({currentOpen: true, modal: false, currentId: currentId});
    }

    renderTable() {
        // 1 - тут формируется структура столбцов от полученных данных из FireBase
        let column = [];

        for (let key in this.state.table[0]) {
            if (key != 'key' && key != 'children') {
                column.push({
                    title: key,
                    dataIndex: key,
                    key: key,
                })
            }

        }

        // 2 - тут отрисовывается таблица которую возвращает функция "filterTable()" (ее описал выше)
        return (
            <Table
                className='tableStyle'
                columns={column}
                dataSource={this.state.table}
            />
        )
    }

    shortfallSum(item, isShortfall) {
        let originalArh = this.props.data.archiveInv.filter((itemArh) => {
            return itemArh['Инвентаризация'] == item.id
        })

        let needSum = 0;
        let shortfallSum = 0;

        originalArh.map((itemArh, index) => {
            let idProducts = this.props.data.remains[itemArh['Id остатков']]['Id продукта'];
            let productPrice = this.props.data.products[idProducts]['Цена'];
            needSum = needSum + (productPrice * itemArh['Кол-во в записи']);
            shortfallSum = shortfallSum + (productPrice * (itemArh['Кол-во в записи'] - itemArh['Кол-во подтвержденных']));
        })

        return isShortfall ? shortfallSum : needSum
    }

    shortfallCount(item, isShortfall) {
        let originalArh = this.props.data.archiveInv.filter((itemArh) => {
            return itemArh['Инвентаризация'] == item.id
        })

        let needCount = 0;
        let shortfallCount = 0;

        originalArh.map((itemArh, index) => {
            needCount = needCount + itemArh['Кол-во в записи'];
            shortfallCount = shortfallCount + (itemArh['Кол-во в записи'] - itemArh['Кол-во подтвержденных']);
        })
        return isShortfall ? shortfallCount : needCount
    }

    getChildren(item, index) {
        let children = [];
        let originalArh = this.props.data.archiveInv.filter((itemArh) => {
            return itemArh['Инвентаризация'] == item.id
        })

        originalArh.map((itemArh, indexArh) => {
            let idProducts = this.props.data.remains[itemArh['Id остатков']]['Id продукта'];
            let productName = this.props.data.products[idProducts]['Название'];
            let productArticle = this.props.data.products[idProducts]['Артикул'];
            let productPrice = this.props.data.products[idProducts]['Цена'];

            children.push({
                'Дата': productName,
                'Категория': productArticle,
                'Кол-во недостачи': itemArh['Кол-во в записи'] - itemArh['Кол-во подтвержденных'],
                'Сумма недостачи': productPrice * (itemArh['Кол-во в записи'] - itemArh['Кол-во подтвержденных']),
                "key": `${index}${indexArh}`
                // "key": index
            })
        })

        return children
    }


    componentDidMount() {
        let invent = [];
        let originalInvent = this.props.data.inventory.filter((item) => {
            return item['Комплекс'] == this.props.userInfo['Комплекс']
        });
        let currentInvent = null;
        let currentId = null;

        originalInvent.map((item, index) => {
            // console.log(this.getChildren(item,index));
            if (item['Статус'] != 'Завершен') {
                currentInvent = item['Статус'];
                currentId = item['id'];
            } else {
                invent.push({
                    'Дата': item['Дата'],
                    'Категория': this.props.data.manCategories[item['Категория']]['Название'],
                    'Кол-во недостачи': this.shortfallCount(item, true),
                    'Сумма недостачи': this.shortfallSum(item, true),
                    "key": index,
                    children: this.getChildren(item, index)
                })
            }
        })

        this.setState({
            table: invent,
            isLoaded: true,
            currentInvent: currentInvent,
            currentId: currentId
        })

        if (currentInvent != null) this.startTimer();
    }

    changeTimer() {
        let endData = new Date(this.state.currentInvent);
        endData.setHours(endData.getHours() + 8);
        let delta = Math.floor((endData - new Date()) / 1000);
        this.setState({
            timer: this.getTimerInfo(delta)
        })
    }

    startTimer() {
        let timerId = setInterval(() => this.changeTimer(), 1000);
    }

    getCurrentInvent() {
        if (this.state.currentInvent === null) {
            return this.props.userInfo.Admins ? <Button type="primary" onClick={() => this.setState({ modal: true })} style={{ marginTop: '15px' }}>Начать инвентаризацию</Button> : null
        } else {
            return <Button onClick={() => this.setState({currentOpen: true})} type="primary">Текущая инвентаризация {this.state.timer}</Button>
        }
    }

    getTimerInfo(t) {
        let TimeInSeconds = t
        return (new Date(TimeInSeconds * 1000).toISOString().substr(11, 8))
    }

    renderArh() {
        return(
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: '#00b96b',
                        colorPrimaryBorder: 'red',
                        colorFillSecondary: 'red'
                    },
                }}
            >
                {this.modalWindow()}
                <Space direction="vertical">
                    <Button type="primary" onClick={() => this.props.back()} ghost style={{ marginTop: '15px' }}>Назад</Button>
                    <h2>Архив инвентаризаций</h2>
                    {this.getCurrentInvent()}
                    {this.renderTable()}
                </Space>
            </ConfigProvider>
        )
    }

    render() {
        return (
            <div>
                {
                    this.state.isLoaded ?
                        (
                            this.state.currentOpen ?
                            <Inventory 
                                timer = {this.state.timer}
                                inventId = {this.state.currentId}
                                dataUpdate = {(data) => this.props.dataUpdate(data)}
                                refresh = {() => {this.props.refresh(); this.componentDidMount(); this.setState({currentOpen: false})}}
                                back={() => this.setState({currentOpen: false})} 
                                data={this.props.data} 
                                userInfo={this.props.userInfo} 
                                mesTest = {(type, mes) => { this.props.mesTest(type, mes) }}
                            />
                            :
                            this.renderArh()
                        )
                        :
                        <Loaders />
                }
            </div>
        );
    }

}