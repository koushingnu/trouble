"use client";

import { useState } from "react";
import { Box, Typography, Tabs, Tab, Container, Paper } from "@mui/material";
import UserList from "./components/UserList";
import TokenManagement from "./components/TokenManagement";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function AdminPage() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          管理画面
        </Typography>

        <Paper sx={{ width: "100%", mb: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="管理画面タブ"
            >
              <Tab label="ユーザー管理" />
              <Tab label="トークン管理" />
            </Tabs>
          </Box>

          <TabPanel value={value} index={0}>
            <UserList />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <TokenManagement />
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
}
