import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const NFTGallery = () => {
  const { address } = useParams();
  const ITEMS_PER_PAGE = 50;
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const filterKeywords = import.meta.env.NFT_FILTER_KEYWORDS?.split(',') || [];
  const didMount = useRef(false);

  // 检查URL是否有效
  const isValidUrl = useCallback((url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  // 检查NFT是否应该被过滤掉
  const shouldFilterNFT = useCallback((nft) => {
    // 检查图片URL是否有效
    const imageUrl = nft.image_url || '';
    if (!isValidUrl(imageUrl)) {
      return false;
    }

    // 检查标题关键词
    if (filterKeywords.length) {
      const title = (nft.name || '').toLowerCase();
      if (filterKeywords.some(keyword => title.includes(keyword))) {
        return false;
      }
    }

    // 检查图片URL是否是IPFS或其他无效来源
    if (imageUrl.includes('ipfs.io') || 
        imageUrl.includes('data:image') || 
        !imageUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return false;
    }

    return true;
  }, [filterKeywords, isValidUrl]);

  // 获取媒体类型
  const getMediaType = useCallback((nft) => {
    const mimeType = nft.mime_type || '';
    const imageUrl = nft.image_url || '';

    if (mimeType.startsWith('video/') || imageUrl.match(/\.(mp4|webm|ogg)$/i)) {
      return 'video';
    }

    return 'image';
  }, []);

  // 渲染NFT媒体内容
  const renderNFTMedia = useCallback((nft) => {
    const mediaType = getMediaType(nft);
    const url = nft.image_url;

    if (mediaType === 'video') {
      return (
        <>
          <video
            src={url}
            className="w-full h-full object-cover"
            controls
            loop
            muted
            playsInline
            autoPlay
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
        </>
      );
    }

    return (
      <img
        src={url}
        alt={nft.name || 'NFT'}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          // 如果图片加载失败，从DOM中移除该NFT卡片
          const card = e.target.closest('.group').parentElement;
          if (card) {
            card.style.display = 'none';
          }
        }}
      />
    );
  }, [getMediaType]);

  const getWalletAddress = useCallback(() => {
    return address || import.meta.env.NFT_WALLET_ADDRESS;
  }, [address]);

  const fetchNFTs = useCallback(async (nextParam = null) => {
    const walletAddress = getWalletAddress();
    const apiKey = import.meta.env.NFT_OPENSEA_API_KEY;

    if (!walletAddress || !apiKey) {
      console.error('Missing configuration:', {
        walletAddress: !!walletAddress,
        apiKey: !!apiKey
      });
      setError(walletAddress ? 'API key not configured' : 'No wallet address specified');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching NFTs with params:', {
        walletAddress,
        next: nextParam,
        limit: ITEMS_PER_PAGE
      });

      const response = await axios.get(
        `https://api.opensea.io/api/v2/chain/ethereum/account/${walletAddress}/nfts`,
        {
          headers: {
            'X-API-KEY': apiKey,
          },
          params: {
            limit: ITEMS_PER_PAGE,
            ...(nextParam ? { next: nextParam } : {}),
          },
        }
      );

      console.log('Response received:', {
        nftsCount: response.data.nfts?.length,
        hasNext: !!response.data.next
      });

      const { nfts: newNFTs, next } = response.data;
      const filteredNFTs = newNFTs.filter(shouldFilterNFT);

      setNfts(prev => nextParam ? [...prev, ...filteredNFTs] : filteredNFTs);
      setNextCursor(next);
      setHasMore(!!next);
    } catch (err) {
      console.error('Error fetching NFTs:', err.response || err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch NFTs');
    } finally {
      setLoading(false);
    }
  }, [getWalletAddress, shouldFilterNFT]);

  useEffect(() => {
    const currentAddress = getWalletAddress();
    if (!currentAddress) return;

    // 在开发环境跳过第一次mount，在生产环境直接执行
    if (process.env.NODE_ENV === 'development' && !didMount.current) {
      didMount.current = true;
      return;
    }

    setNfts([]);
    setNextCursor(null);
    setHasMore(true);
    setError(null);
    setLoading(true);
    fetchNFTs();
  }, [getWalletAddress]);

  // 加载更多
  const loadMore = () => {
    if (!loading && hasMore) {
      setLoading(true);
      fetchNFTs(nextCursor);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center text-red-600">
          <p>Error loading NFTs: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {address && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl text-center">
              NFTs for {address.slice(0, 6)}...{address.slice(-4)}
            </h1>
            <p className="mt-2 text-center text-gray-600">
              <Link to="/" className="text-primary hover:text-primary-dark">
                View my collection
              </Link>
            </p>
          </div>
        )}
        {!address && (
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl text-center mb-8">
            My NFT Collection
          </h1>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {nfts.map((nft, index) => (
            <div key={`${nft.contract}-${nft.identifier}-${index}`}>
              <Link
                to={`/nft/${nft.contract}/${nft.identifier}`}
                className="block group"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="w-full h-[300px] bg-gray-200 rounded-t-lg overflow-hidden">
                    {renderNFTMedia(nft)}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {nft.name || 'Unnamed NFT'}
                    </h3>
                    {nft.collection && (
                      <p className="mt-1 text-sm text-gray-500 truncate">
                        {nft.collection}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTGallery;
