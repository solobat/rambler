import * as React from 'react';
import { useCallback, useContext, useMemo, useState } from 'react';
import { generateUrl, getValidNetworks, Network, NetworkOption } from '../../../common/socialShare';
import { getPureBookName } from '../newtab.helper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/reducers';

const networks = getValidNetworks();

export default function ShareIcons() {
  const { paragraph, currentBook } = useSelector((state: RootState) => state.readers);
  const [selectedText, setSelectedText] = useState('');
  const sharedText = useMemo(() => {
    if (selectedText) {
      return selectedText;
    } else {
      return paragraph.text;
    }
  }, [paragraph, selectedText]);
  const onShareHover = useCallback(() => {
    const selection = window.getSelection();

    if (selection && selection.toString()) {
      setSelectedText(selection.toString());
    } else {
      setSelectedText('');
    }
  }, []);
  const onShareClick = (network) => {
    const config: NetworkOption = {
      title: `${sharedText} #${getPureBookName(true, currentBook)}#`,
    };
    const url: string = generateUrl(network.url, config);

    chrome.tabs.create({
      url,
    });
  };

  return (
    <div className="share-icons">
      {networks.map((network, index) => {
        return <ShareIcon network={network} key={index} onHover={onShareHover} onClick={onShareClick} />;
      })}
    </div>
  );
}

interface ShareIconProps {
  network: Network;
  onHover: () => void;
  onClick: (network: Network) => void;
}

function ShareIcon(props: ShareIconProps) {
  const { network, onHover, onClick } = props;
  const className: string = ['icon-share', `icon-share-${network.className}`].join(' ');

  return <i className={className} onMouseEnter={onHover} onClick={() => onClick(network)}></i>;
}
