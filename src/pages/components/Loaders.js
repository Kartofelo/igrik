import React from 'react'; //импорт компонентов из библиотеки реакт
import { LoadingOutlined } from '@ant-design/icons';
import { Spin, ConfigProvider, Space   } from 'antd';

const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 24,
      }}
      spin
    />
  );

export default class Loaders extends React.Component {

    render() {
        return(
            <div className='loaderDiv'>
                <ConfigProvider
                    theme={{
                        token: {
                            colorPrimary: '#00b96b',
                            colorPrimaryBorder: 'red'
                        },
                    }}
                >
                    <Space direction="horizontal" size={20}>
                        {this.props.text}
                        <Spin indicator={antIcon} />
                    </Space>
                </ConfigProvider>
            </div>
        )
    }
}