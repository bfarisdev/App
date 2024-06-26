import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import DistanceRequest from '@components/DistanceRequest';
import Navigation from '@libs/Navigation/Navigation';
import reportPropTypes from '@pages/reportPropTypes';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {iouPropTypes} from './propTypes';

const propTypes = {
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: iouPropTypes,

    /** The report on which the request is initiated on */
    report: reportPropTypes,

    /** Passed from the navigator */
    route: PropTypes.shape({
        /** Parameters the route gets */
        params: PropTypes.shape({
            /** Type of IOU */
            iouType: PropTypes.oneOf(_.values(CONST.IOU.TYPE)),
            /** Id of the report on which the distance request is being created */
            reportID: PropTypes.string,
        }),
    }),
};

const defaultProps = {
    iou: {},
    report: {},
    route: {
        params: {
            iouType: '',
            reportID: '',
        },
    },
};

// This component is responsible for getting the transactionID from the IOU key, or creating the transaction if it doesn't exist yet, and then passing the transactionID.
// You can't use Onyx props in the withOnyx mapping, so we need to set up and access the transactionID here, and then pass it down so that DistanceRequest can subscribe to the transaction.
function NewDistanceRequestPage({iou, report, route}) {
    const iouType = lodashGet(route, 'params.iouType', 'request');
    const isEditingNewRequest = Navigation.getActiveRoute().includes('address');

    useEffect(() => {
        if (iou.transactionID) {
            return;
        }
        IOU.setUpDistanceTransaction();
    }, [iou.transactionID]);

    const onSubmit = useCallback(() => {
        if (isEditingNewRequest) {
            Navigation.goBack(ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(iouType, report.reportID));
            return;
        }
        IOU.navigateToNextPage(iou, iouType, report);
    }, [iou, iouType, isEditingNewRequest, report]);

    return (
        <DistanceRequest
            report={report}
            route={route}
            isEditingNewRequest={isEditingNewRequest}
            transactionID={iou.transactionID}
            onSubmit={onSubmit}
        />
    );
}

NewDistanceRequestPage.displayName = 'NewDistanceRequestPage';
NewDistanceRequestPage.propTypes = propTypes;
NewDistanceRequestPage.defaultProps = defaultProps;
export default withOnyx({
    iou: {key: ONYXKEYS.IOU},
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID')}`,
    },
})(NewDistanceRequestPage);
