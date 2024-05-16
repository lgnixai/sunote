import classes from "./style.module.scss";
import clsx from "clsx";
import surrealistLogo from "~/assets/images/logo.png";
import { ScrollArea, Stack, Divider, Image, Flex, Group } from "@mantine/core";
import { Fragment, useLayoutEffect, useMemo } from "react";
import { adapter, isBrowser, isDesktop } from "~/adapter";
import { iconDownload, iconCog, iconSearch } from "~/util/icons";
import { NavigationIcon } from "../NavigationIcon";
import { Spacer } from "../Spacer";
import { VIEW_MODES } from "~/constants";
import { useStable } from "~/hooks/stable";
import { useConfigStore } from "~/stores/config";
import { ViewMode } from "~/types";
import { useFeatureFlags } from "~/util/feature-flags";
import { updateTitle } from "~/util/helpers";
import { useIsLight } from "~/hooks/theme";
import { SurrealistLogo } from "../SurrealistLogo";
import { useConnection } from "~/hooks/connection";
import { useSetting } from "~/hooks/config";
import {useDisclosure, useHover} from "@mantine/hooks";
import { useBoolean } from "~/hooks/boolean";
import { Shortcut } from "../Shortcut";
import {LocalDatabase} from "~/components/Toolbar/components/LocalDatabase";
import {Connections} from "~/components/Toolbar/components/Connections";
import {ConnectionsLogo} from "~/components/Toolbar/components/Connections/logo";

const NAVIGATION: ViewMode[][] = [
	[
		"rss",
		"chat",
		"note",
		"knowledge",
	],
	[

		"query",
		"explorer",
		"designer",
		"authentication",
	],
	[
		"functions",
		"models",
	],
	[
		"documentation",
	],
];

export interface SidebarProps {
	onToggleDownload: () => void;
	onTogglePalette: () => void;
	onToggleSettings: () => void;
}

export function Sidebar({
	onToggleDownload,
	onTogglePalette,
	onToggleSettings,
}: SidebarProps) {
	const { setActiveView } = useConfigStore.getState();
	const [showConsole, setShowConsole] = useDisclosure();

	const [flags] = useFeatureFlags();
	const [expandable] = useSetting("appearance", "expandSidebar");
	const [expanded, expandedHandle] = useBoolean();

	const isLight = useIsLight();
	const connection = useConnection();
	const activeView = useConfigStore((s) => s.activeView);
	const { ref, hovered } = useHover();

	useLayoutEffect(() => {
		expandedHandle.set(false);
	}, [hovered]);

	const setViewMode = useStable((id: ViewMode) => {
		updateTitle();
		setActiveView(id);
		expandedHandle.close();
	});

	const navigation = useMemo(() => {
		return NAVIGATION.flatMap((row) => {
			const items = row.flatMap((id) => {
				const info = VIEW_MODES[id];

				return (!info || !info.disabled?.(flags) !== true) ? [] : [info];
			});

			return items.length > 0 ? [items] : [];
		});
	}, [flags, connection]);

	const shouldExpand = connection && expandable && expanded;
	const nudgeSidebar = adapter.platform === "darwin" && isDesktop;

	return (
		<ScrollArea
			scrollbars="y"
			type="never"
			pos="fixed"
			component="aside"
			top={0}
			left={0}
			bottom={0}
			pt={nudgeSidebar ? 28 : 0}
			bg={connection ? (isLight ? "slate.0" : "slate.9") : undefined}
			viewportRef={ref}
			className={clsx(classes.root, shouldExpand && classes.expanded)}
		>
			<Flex
				direction="column"
				h="100%"
				px={16}
				pb={18}
			>
				<Group wrap="nowrap" gap="lg" pt="sm">
					<ConnectionsLogo />

				</Group>
				<Stack
					gap="sm"
					h="100%"
					mt={24}
					component="nav"
				>
					{connection && navigation.map((items, i) => (
						<Fragment key={i}>
							{items.map(info => (
								<Group
									key={info.id}
									gap="lg"
									wrap="nowrap"
								>
									<NavigationIcon
										name={info.name}
										isActive={info.id === activeView}
										icon={info.anim || info.icon}
										withTooltip={!expandable}
										onClick={() => setViewMode(info.id)}
										//onMouseEnter={expandedHandle.open}
									/>
								</Group>
							))}
							{i < navigation.length - 1 && (
								<Divider color={isLight ? "white" : "slate.7"} />
							)}
						</Fragment>
					))}

					<Spacer />

					{isBrowser && (
						<NavigationIcon
							name="Download App"
							icon={iconDownload}
							onClick={onToggleDownload}
						/>
					)}

					<NavigationIcon
						name={
							<Group wrap="nowrap">
								Search
								<Shortcut value="mod K" />
							</Group>
						}
						icon={iconSearch}
						onClick={onTogglePalette}
					/>

					<NavigationIcon
						name="Settings"
						icon={iconCog}
						onClick={onToggleSettings}
					/>
				</Stack>
			</Flex>
		</ScrollArea>
	);
}
