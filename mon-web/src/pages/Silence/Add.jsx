import React, { Component } from 'react';
import { Button, Row, Col, message } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import queryString from 'query-string';
import { FormattedMessage, injectIntl } from 'react-intl';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import request from '@pkgs/request';
import api from '@common/api';
import { NsTreeContext } from '@pkgs/Layout/Provider';
import { addSilence } from './services';
import CustomForm from './CustomForm';
import { normalizReqData } from './utils';

class Add extends Component {
  static contextType = NsTreeContext;

  static propTypes = {
  };

  static defaultProps = {
  };

  constructor(props) {
    super(props);
    this.state = {
      nid: undefined,
      initialValues: {},
      submitLoading: false,
    };
  }

  componentDidMount = () => {
    const search = _.get(this.props, 'location.search');
    const query = queryString.parse(search);

    if (query && (query.cur || query.his)) {
      const type = query.cur ? 'cur' : 'his';
      const id = query.cur || query.his;
      this.fetchHistoryData(type, id);
    }
    if (query && query.nid) {
      this.setState({ nid: _.toNumber(query.nid) });
    }
  }

  fetchHistoryData(type, id) {
    request(`${api.event}/${type}/${id}`, {
    }).then((res) => {
      this.setState({
        initialValues: {
          category: res.category,
          metric: _.get(res, 'detail[0].metric'),
          endpoints: _.get(res, 'endpoint'),
          tags: res.tags,
          cur_nid_paths: [_.toNumber(res.cur_id)],
        },
      });
    });
  }

  handleSubmit = () => {
    const { history } = this.props;
    const treeData = _.get(this.context, 'data.treeData');
    this.customForm.validateFields((errors, data) => {
      if (!errors) {
        const reqData = normalizReqData(data);
        reqData.nid = this.state.nid;

        if (reqData.category === 2) {
          reqData.nids = [_.toString(reqData.nid)];
          const { curNidPaths } = reqData;
          reqData.cur_nid_paths = {};
          _.map(curNidPaths, (item) => {
            reqData.cur_nid_paths[item] = _.get(_.find(treeData, { id: _.toNumber(item) }), 'path');
          });
        }

        this.setState({ submitLoading: true });
        addSilence(reqData).then(() => {
          message.success(this.props.intl.formatMessage({ id: 'msg.create.success' }));
          history.push({
            pathname: '/silence',
          });
        }).finally(() => {
          this.setState({ submitLoading: false });
        });
      }
    });
  }

  render() {
    const treeData = _.get(this.context, 'data.treeData');
    const { submitLoading, initialValues, nid } = this.state;
    const now = moment();

    if (nid === undefined) return null;

    return (
      <div>
        <CustomForm
          ref={(ref) => { this.customForm = ref; }}
          treeData={treeData}
          initialValues={{
            nid,
            btime: now.clone().unix(),
            etime: now.clone().add(1, 'hours').unix(),
            cause: this.props.intl.formatMessage({ id: 'silence.cause.default' }),
            ...initialValues,
          }}
        />
        <Row>
          <Col offset={6}>
            <Button onClick={this.handleSubmit} loading={submitLoading} type="primary">
              <FormattedMessage id="form.submit" />
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default CreateIncludeNsTree(injectIntl(Add));
