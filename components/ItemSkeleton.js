import { Box, Row, Skeleton } from "native-base";
import React from "react";
import { IMAGE_RATIO, ITEM_HEIGHT } from "../modules/constants";

function ItemSkeleton() {
  return (
    <Row h={ITEM_HEIGHT} w="full" mb={4} rounded="lg">
      <Skeleton h={ITEM_HEIGHT} w={IMAGE_RATIO * ITEM_HEIGHT} rounded="lg" />
      <Box flex={1} px={4} py={2}>
        <Skeleton.Text lines={5} />
      </Box>
    </Row>
  );
}

export default ItemSkeleton;
