/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import Tooltip from "../tooltip/tooltip.jsx";
import ObserveSize from "react-observe-size";
import Icon from "../icons/icon.jsx";
import constants from "../common-canvas/constants/canvas-constants";
import classNames from "classnames";

import styles from "./toolbar.scss";

// eslint override
/* eslint no-return-assign: "off" */

class Toolbar extends React.Component {
	constructor(props) {
		super(props);

		this.toolbarIconWidth = parseInt(styles.toolbarButtonWidth, 10); // ParseInt to remove "px"
		this.dividerWidth = parseInt(styles.toolbarDividerWidth, 10); // ParseInt to remove "px"

		const numDefaultIcons = this.props.notificationConfig ? 5 : 4;
		this.defaultToolbarWidth = this.toolbarIconWidth * numDefaultIcons; // Width of toolbar with palette, zoom, and notification icons
		this.maxToolbarWidth = 0; // Width of toolbar if displaying all icons and dividers

		this.state = {
			showExtendedMenu: false
		};

		this.setToolbarDisplayItemsCount = this.setToolbarDisplayItemsCount.bind(this);
		this.generatePaletteIcon = this.generatePaletteIcon.bind(this);
		this.generateNotificationIcon = this.generateNotificationIcon.bind(this);
		this.toggleShowExtendedMenu = this.toggleShowExtendedMenu.bind(this);
		this.toolbarMenuActionHandler = this.toolbarMenuActionHandler.bind(this);
	}

	componentDidMount() {
		if (this.props.config) {
			this.calculateMaxToolbarWidth(this.props.config);
		}
		this.setToolbarDisplayItemsCount();
	}

	setToolbarDisplayItemsCount() {
		const displayItemsCount = this.calculateDisplayItems(this.toolbar.offsetWidth);
		if (displayItemsCount !== this.state.displayItemsCount) {
			this.setState({ displayItemsCount: displayItemsCount });
		}
	}

	// Need to set a className for notification bell icon in the DOM
	// to be used in notification-panel.jsx: handleNotificationPanelClickOutside()
	getActionClassName(action) {
		return action.indexOf(constants.NOTIFICATION_BELL_ICON.DEFAULT) > -1 ? "notificationBellIcon" : action;
	}

	getNotificationIconStateObject(isIconEnabled) {
		const notificationMessages = this.props.canvasController.getNotificationMessages();
		const errorMessages = this.props.canvasController.getNotificationMessages(constants.ERROR);
		const warningMessages = this.props.canvasController.getNotificationMessages(constants.WARNING);
		const successMessages = this.props.canvasController.getNotificationMessages(constants.SUCCESS);

		let className = "canvas-icon fill " + constants.NOTIFICATION_BELL_ICON.DEFAULT + " " + constants.INFO;
		if (isIconEnabled) {
			const bellIconClassName = "canvas-icon fill " + constants.NOTIFICATION_BELL_ICON.DOT + " ";
			if (errorMessages.length > 0) {
				className = bellIconClassName + constants.ERROR;
			} else if (warningMessages.length > 0) {
				className = bellIconClassName + constants.WARNING;
			} else if (successMessages.length > 0) {
				className = bellIconClassName + constants.SUCCESS;
			} else {
				className = bellIconClassName + constants.INFO;
			}
		}
		return {
			icon: notificationMessages.length > 0 ? constants.NOTIFICATION_BELL_ICON.DOT : constants.NOTIFICATION_BELL_ICON.DEFAULT,
			className: className
		};
	}

	calculateMaxToolbarWidth(list) {
		let totalWidthSize = this.defaultToolbarWidth;
		for (let i = 0; i < list.length; i++) {
			if (list[i].action) {
				totalWidthSize += this.toolbarIconWidth;
			} else if (list[i].divider) {
				totalWidthSize += this.dividerWidth;
			}
		}

		this.maxToolbarWidth = totalWidthSize;
	}

	calculateDisplayItems(toolbarWidth) {
		const numObjects = this.props.config.length;
		if (this.maxToolbarWidth >= toolbarWidth) { // need to minimize
			const definition = this.props.config;
			let availableWidth = toolbarWidth - this.defaultToolbarWidth + this.toolbarIconWidth;

			if (availableWidth < this.toolbarIconWidth) {
				return 0;
			}

			let items = 0;
			for (let i = 0; i < definition.length; i++) {
				if (definition[i].action) {
					availableWidth -= this.toolbarIconWidth;
					items++;
				} else if (definition[i].divider) {
					availableWidth -= this.dividerWidth;
					items++;
				}

				if (availableWidth < this.toolbarIconWidth) {
					items--;
					break;
				}
			}
			return items;
		}
		return numObjects;
	}

	generateActionItems(definition, displayItemsCount, actionsHandler, overflow) {
		const utilityActions = [];
		const dividerClassName = overflow ? "overflow-toolbar-divider" : "toolbar-divider";
		for (let i = 0; i < displayItemsCount; i++) {
			const actionObj = definition[i];
			if (actionObj.action) {
				const actionId = actionObj.action + "-action";
				if (actionObj.action.startsWith("notification") || actionObj.action.startsWith(constants.NOTIFICATION_BELL_ICON.DEFAULT)) {
					utilityActions[i] = this.generateNotificationIcon(actionObj, actionId, overflow);
				} else if (actionObj.action.startsWith("palette")) {
					actionObj.enable = true;
					utilityActions[i] = this.generatePaletteIcon(actionObj, overflow);
				} else if (actionObj.enable === true) {
					utilityActions[i] = this.generateActionIcon(actionObj, actionId, actionsHandler, overflow);
				} else { // disable
					utilityActions[i] = this.generateActionIcon(actionObj, actionId, null, overflow);
				}
			} else {
				utilityActions[i] = (<div key={"toolbar-divider-" + i} className={dividerClassName} />);
			}
		}

		if (definition.length !== displayItemsCount &&
			!(definition.length - 1 === displayItemsCount && definition[displayItemsCount].divider)) { // Don't show overflow icon if last item is divider.
			utilityActions[displayItemsCount] = this.generatedExtendedMenu(definition, displayItemsCount, actionsHandler);
		}

		return utilityActions;
	}

	generateActionIcon(actionObj, actionId, actionsHandler, overflow) {
		const overflowClassName = overflow ? "overflow" : "";
		let actionClickHandler = actionObj.callback;
		if (typeof actionsHandler === "function") {
			actionClickHandler = () => actionsHandler(actionObj.action);
		}

		const iconClassname = actionObj.className ? { className: actionObj.className } : {};
		let icon = <Icon type={actionObj.action} disabled={!actionObj.enable} {...iconClassname} />;

		// Customer provided icon.
		if (actionObj.iconEnabled && actionObj.iconDisabled) {
			const customIcon = actionObj.enable ? actionObj.iconEnabled : actionObj.iconDisabled;
			icon = (<img id={"toolbar-icon-" + actionObj.action} className={"toolbar-icons " + overflowClassName} disabled={!actionObj.enable}
				src={customIcon}
			/>);
		}

		const tooltipId = actionId + "-" + this.props.canvasController.getInstanceId() + "-tooltip";
		const iconButtonClassname = classNames("list-item", overflowClassName, { "list-item-disabled": !actionObj.enable });
		const itemContainersClassname = classNames("list-item-containers", overflowClassName, this.getActionClassName(actionObj.action));

		return (
			<li id={actionId} key={actionId} className={itemContainersClassname}>
				<Tooltip id={tooltipId} tip={actionObj.label} disable={overflow}>
					<a onClick={actionClickHandler} className={iconButtonClassname} >
						<div className={"toolbar-item " + overflowClassName}>
							{icon}
							{this.generateLabel(false, overflow, actionObj.label)}
						</div>
					</a>
				</Tooltip>
			</li>
		);
	}

	generatePaletteIcon(actionObj, overflow) {
		actionObj.action = "paletteOpen";
		actionObj.callback = this.props.canvasController.openPalette.bind(this.props.canvasController);
		let palette = this.generateActionIcon(actionObj, "palette-open-action", null, overflow);

		if (this.props.isPaletteOpen) {
			actionObj.action = "paletteClose";
			actionObj.callback = this.props.canvasController.closePalette.bind(this.props.canvasController);
			palette = this.generateActionIcon(actionObj, "palette-close-action", null, overflow);
		}
		return palette;
	}

	generateNotificationIcon(actionObj, actionId, overflow) {
		const notificationStateObj = this.getNotificationIconStateObject(actionObj.enable);
		actionObj.icon = notificationStateObj.icon;
		actionObj.className = notificationStateObj.className;
		actionObj.callback = this.props.canvasController.openNotificationPanel.bind(this.props.canvasController);

		let notification;
		if (actionObj.enable) {
			actionObj.action = constants.NOTIFICATION_BELL_ICON.DOT;
			notification = this.generateActionIcon(actionObj, "notification-open-action", null, overflow);
		} else {
			actionObj.action = constants.NOTIFICATION_BELL_ICON.DEFAULT;
			notification = this.generateActionIcon(actionObj, actionId, null, overflow);
		}

		if (this.props.isNotificationOpen) {
			actionObj.callback = this.props.canvasController.closeNotificationPanel.bind(this.props.canvasController);
			notification = this.generateActionIcon(actionObj, "notification-close-action", null, overflow);
		}
		return notification;
	}

	generatedExtendedMenu(actions, displayItemsCount, actionsHandler) {
		const subActionsList = actions.slice(displayItemsCount, actions.length);
		const subActionsListItems = this.generateActionItems(subActionsList, subActionsList.length, actionsHandler, true);
		const subMenuClassName = this.state.showExtendedMenu === true ? "" : "toolbar-popover-list-hide";
		return (
			<li id={"overflow-action"} key={"overflow-action"} className="list-item-containers" >
				<a onClick={() => this.toggleShowExtendedMenu()} className="overflow-action-list-item list-item toolbar-divider">
					<div className="toolbar-item">
						<Icon type="overflow" />
					</div>
				</a>
				<ul className={"toolbar-popover-list " + subMenuClassName}>
					{subActionsListItems}
				</ul>
			</li>
		);
	}

	generateLabel(disable, overflow, label) {
		const disabled = disable ? "disabled" : "";
		if (overflow) {
			return (<div className={"overflow-toolbar-icon-label " + disabled}>{label}</div>);
		}
		return (<div />);
	}

	toggleShowExtendedMenu() {
		this.setState({ showExtendedMenu: !this.state.showExtendedMenu });
	}

	toolbarMenuActionHandler(action) {
		this.props.canvasController.toolbarMenuActionHandler(action);
	}

	render() {
		const that = this;
		let actionContainer = <div />;
		if (this.props.config && this.props.config.length > 0) {
			const actions = that.generateActionItems(that.props.config, this.state.displayItemsCount, this.toolbarMenuActionHandler, false);
			actionContainer = (<div key={"actions-container"} id={"actions-container"} className="toolbar-items-container">
				{actions}
			</div>);
		}

		let rightAlignedActionItems = [
			{ action: "zoomIn", label: "Zoom In", enable: true, callback: this.props.canvasController.zoomIn.bind(this.props.canvasController) },
			{ action: "zoomOut", label: "Zoom Out", enable: true, callback: this.props.canvasController.zoomOut.bind(this.props.canvasController) },
			{ action: "zoomToFit", label: "Zoom to Fit", enable: true, callback: this.props.canvasController.zoomToFit.bind(this.props.canvasController) }
		];

		if (this.props.notificationConfig &&
			typeof this.props.notificationConfig.action !== "undefined" &&
			typeof this.props.notificationConfig.enable !== "undefined") {
			const notificationBell = [
				{ divider: true },
				this.props.notificationConfig
			];
			rightAlignedActionItems = rightAlignedActionItems.concat(notificationBell);
		}

		const rightAlignedContainerItems = this.generateActionItems(rightAlignedActionItems, rightAlignedActionItems.length, null, false);
		const rightAlignedContainer = (<div id="zoom-actions-container" className="toolbar-items-container">
			{rightAlignedContainerItems}
		</div>);

		const canvasToolbar = (
			<div id="canvas-toolbar" ref={ (elem) => this.toolbar = elem}>
				<ObserveSize observerFn={(element) => this.setToolbarDisplayItemsCount()}>
					<ul id="toolbar-items">
						{actionContainer}
						{rightAlignedContainer}
					</ul>
				</ObserveSize>
			</div>);

		return canvasToolbar;
	}
}

Toolbar.propTypes = {
	config: PropTypes.array,
	isPaletteOpen: PropTypes.bool,
	isNotificationOpen: PropTypes.bool,
	notificationConfig: PropTypes.object,
	canvasController: PropTypes.object.isRequired
};

export default Toolbar;
