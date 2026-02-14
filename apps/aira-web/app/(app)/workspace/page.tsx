'use client';

import React, { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { ScreenLayout } from '@/components/layout';
import {
  TopTabBar,
  ConnectorListItem,
  ConnectorDetailDialog,
  EmptyState,
  RuleItem,
} from '@/components/workspace';
import { ROUTES } from '@/lib/constants';
import {
  useConnectors,
  useConnectConnector,
  useRules,
  useUpdateRule,
  useUser,
  useWahaDisconnect,
  useDisconnectConnector,
} from '@repo/core';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const TABS = [
  { id: 'rules', label: 'Rules' },
  { id: 'connectors', label: 'Connectors' },
];

// Map API service names to UI connector types
type ConnectorType = 'whatsapp' | 'email' | 'calendar' | 'drive';

// Service name used in API calls
type ServiceName = 'email_scope' | 'google_calendar' | 'google_drive';

interface UIConnector {
  id: string;
  serviceName?: ServiceName;
  name: string;
  type: ConnectorType;
  isConnected: boolean;
  rulesCount: number;
  groupsCount?: number;
  lastSync?: string;
}

export default function WorkspacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'rules';
  const [connectingId, setConnectingId] = React.useState<string | null>(null);
  const [openConnectorId, setOpenConnectorId] = React.useState<string | null>(
    null,
  );

  const { data: user } = useUser();

  const { mutate: wahaDisconnect, isPending: isDisconnecting } =
    useWahaDisconnect();
  const { mutate: disconnectConnector, isPending: isDisconnectingConnector } =
    useDisconnectConnector();

  const handleTabChange = (tab: string) => {
    router.replace(`${ROUTES.WORKSPACE}?tab=${tab}`);
  };

  // Fetch connectors
  const { data: connectorsData, isLoading: isLoadingConnectors } =
    useConnectors();

  // Fetch rules
  const {
    data: rulesData,
    isLoading: isLoadingRules,
    refetch: refetchRules,
  } = useRules();

  // Update rule mutation (for toggle)
  const { mutate: updateRule } = useUpdateRule();

  // Connect mutation
  const { mutate: connectConnector } = useConnectConnector();

  // Handle rule toggle
  const handleRuleToggle = (
    ruleId: string,
    currentStatus: 'active' | 'inactive',
    wId: string[],
    rawText: string,
  ) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    updateRule(
      {
        rule_id: ruleId,
        w_id: wId,
        raw_text: rawText,
        status: newStatus,
      },
      {
        onSuccess: () => {
          // Refetch rules to update the UI
          refetchRules();
        },
      },
    );
  };

  // Build connectors list with connection status from API
  const connectors: UIConnector[] = useMemo(() => {
    const availableServices = connectorsData?.available_services ?? [];
    const whatsappRulesCount = rulesData?.length ?? 0;

    return [
      {
        id: 'whatsapp',
        name: 'WhatsApp',
        type: 'whatsapp' as ConnectorType,
        isConnected: availableServices.includes('whatsapp'),
        rulesCount: whatsappRulesCount,
        groupsCount: 0,
        lastSync: whatsappRulesCount > 0 ? 'Synced' : undefined,
      },
      {
        id: 'email',
        serviceName: 'email_scope' as ServiceName,
        name: 'Email',
        type: 'email' as ConnectorType,
        isConnected: availableServices.includes('email_scope'),
        rulesCount: 0,
      },
      {
        id: 'calendar',
        serviceName: 'google_calendar' as ServiceName,
        name: 'Google Calendar',
        type: 'calendar' as ConnectorType,
        isConnected: availableServices.includes('google_calendar'),
        rulesCount: 0,
      },
      {
        id: 'drive',
        serviceName: 'google_drive' as ServiceName,
        name: 'Google Drive',
        type: 'drive' as ConnectorType,
        isConnected: availableServices.includes('google_drive'),
        rulesCount: 0,
      },
    ];
  }, [connectorsData, rulesData]);

  const handleConnectorClick = async (connector: UIConnector) => {
    if (connector.isConnected) {
      setOpenConnectorId(prev => (prev === connector.id ? null : connector.id));
    } else {
      // Initiate connection flow
      if (connector.type === 'whatsapp') {
        router.push(ROUTES.WHATSAPP_SETUP);
      } else if (connector.serviceName) {
        setConnectingId(connector.id);
        connectConnector(
          { connectorType: connector.serviceName, platform: 'web' },
          {
            onSuccess: data => {
              // Redirect to OAuth URL
              if (data.redirect_url) {
                window.location.href = data.redirect_url;
              }
            },
            onError: error => {
              console.error('Failed to connect:', error);
              setConnectingId(null);
            },
          },
        );
      }
    }
  };

  const getConnectorSubtitle = (connector: UIConnector) => {
    if (!connector.isConnected) return 'Tap to connect';
    if (connector.type === 'whatsapp') {
      return `WhatsApp Connected`;
    }
    return 'Tap to manage';
  };

  const getConnectorMeta = (connector: UIConnector) => {
    if (!connector.isConnected) return undefined;
    const parts: string[] = [];
    if (connector.rulesCount > 0) {
      parts.push(`${connector.rulesCount} rules`);
    }
    if (connector.lastSync) {
      parts.push(connector.lastSync);
    }
    return parts.length > 0 ? parts.join(' • ') : undefined;
  };

  return (
    <ScreenLayout maxWidth="md" className="py-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <p className="text-muted-foreground">Manage your workspace</p>
        </div>

        {/* Tab Bar */}
        <TopTabBar
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Loading State */}
        {(isLoadingConnectors || (activeTab === 'rules' && isLoadingRules)) && (
          <div className="space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {!isLoadingConnectors && !(activeTab === 'rules' && isLoadingRules) && (
          <AnimatePresence mode="wait">
            {activeTab === 'rules' ? (
              <motion.div
                key="rules"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {rulesData && rulesData.length > 0 && (
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      All Rules
                    </h2>
                    <Link href={ROUTES.RULES_NEW}>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        New Rule
                      </Button>
                    </Link>
                  </div>
                )}

                {rulesData && rulesData.length > 0 ? (
                  <div className="space-y-3">
                    {rulesData.map((rule, index) => (
                      <motion.div
                        key={rule.rule_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <RuleItem
                          id={rule.rule_id}
                          title={
                            rule.raw_text.slice(0, 50) +
                            (rule.raw_text.length > 50 ? '...' : '')
                          }
                          description={rule.raw_text}
                          connectorType="whatsapp"
                          isEnabled={rule.status === 'active'}
                          onToggle={() =>
                            handleRuleToggle(
                              rule.rule_id,
                              rule.status ?? 'active',
                              rule.w_id,
                              rule.raw_text,
                            )
                          }
                          onClick={() =>
                            router.push(ROUTES.RULES_EDIT(rule.rule_id))
                          }
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <EmptyState type="rules" />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="connectors"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* All Connectors */}
                <div>
                  <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Integrations
                  </h2>
                  <div className="relative">
                    {/* Timeline */}
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col items-center">
                      {connectors.map((_, idx) => (
                        <React.Fragment key={idx}>
                          <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                          {idx < connectors.length - 1 && (
                            <div className="w-px flex-1 bg-border" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    {/* List */}
                    <div className="space-y-3 pl-6">
                      {connectors.map((connector, idx) => (
                        <div
                          key={connector.id}
                          className="relative"
                          onClick={
                            connector.isConnected
                              ? e => e.nativeEvent.stopImmediatePropagation()
                              : undefined
                          }
                        >
                          <ConnectorListItem
                            id={connector.id}
                            name={connector.name}
                            type={connector.type}
                            isConnected={connector.isConnected}
                            subtitle={getConnectorSubtitle(connector)}
                            meta={getConnectorMeta(connector)}
                            onClick={() => handleConnectorClick(connector)}
                            isLoading={connectingId === connector.id}
                            index={idx}
                          />
                          <AnimatePresence>
                            {openConnectorId === connector.id && (
                              <ConnectorDetailDialog
                                connector={connector}
                                userEmail={user?.e}
                                onClose={() => setOpenConnectorId(null)}
                                onModerate={
                                  connector.type === 'whatsapp'
                                    ? () =>
                                        router.push(
                                          ROUTES.WHATSAPP_GROUP_SELECTION,
                                        )
                                    : undefined
                                }
                                onDisconnect={
                                  connector.type === 'whatsapp'
                                    ? () =>
                                        wahaDisconnect(undefined, {
                                          onSuccess: () =>
                                            setOpenConnectorId(null),
                                        })
                                    : connector.serviceName
                                      ? () =>
                                          disconnectConnector(
                                            connector.serviceName!,
                                            {
                                              onSuccess: () =>
                                                setOpenConnectorId(null),
                                            },
                                          )
                                      : undefined
                                }
                                isDisconnecting={
                                  connector.type === 'whatsapp'
                                    ? isDisconnecting
                                    : isDisconnectingConnector
                                }
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </ScreenLayout>
  );
}
