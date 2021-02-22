import React, { Component } from 'react';
import { Input, Upload, Icon, Button } from 'antd';
import _ from 'lodash';

interface Props {
  value: string;
  onChange?: ((event: React.ChangeEvent<HTMLTextAreaElement>) => void) | undefined;
  placeholder: string;
}

export default class InputWithUpload extends Component<Props> {
  render() {
    const uploadprops = {
      name: "file",
      beforeUpload: (file: any) => {
        if (window.FileReader) {
          var reader = new FileReader();
          reader.onload = () => {
            if (_.isString(reader.result) && this.props.onChange) {
              this.props.onChange({
                target: {
                  value: reader.result
                }
              } as React.ChangeEvent<HTMLTextAreaElement>);
            }
          };
          reader.readAsText(file);
        }
        return false;
      },
      showUploadList: false,
    };
    return (
      <>
        <Input.TextArea
          value={this.props.value}
          onChange={this.props.onChange}
          placeholder={this.props.placeholder}
        />
        <Upload {...uploadprops}>
          <Button>
            <Icon type="upload" /> 点击上传
          </Button>
        </Upload>
      </>
    );
  }
}
